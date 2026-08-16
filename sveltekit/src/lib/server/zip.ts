import { crc32 } from 'node:zlib';

export type ZipEntry = {
	name: string;
	data: Uint8Array;
};

const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIR_SIGNATURE = 0x06054b50;

const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const END_OF_CENTRAL_DIR_SIZE = 22;

const VERSION_NEEDED = 20;
const METHOD_STORE = 0;
const UTF8_FLAG = 0x0800;

/** MS-DOS Zeitstempel: Sekunden in 2er-Schritten, Jahre ab 1980. */
const toDosDateTime = (date: Date) => {
	const year = Math.max(1980, date.getFullYear());
	return {
		time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
		date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
	};
};

/**
 * Baut ein ZIP-Archiv ohne Kompression (Methode "store").
 * Bilddaten sind bereits komprimiert (JPEG/PNG/WebP), Deflate würde nichts bringen.
 * Kein ZIP64 – Aufrufer müssen die Gesamtgröße unter 4 GiB halten.
 */
export const buildZip = (entries: ZipEntry[], modifiedAt = new Date()) => {
	const { time: dosTime, date: dosDate } = toDosDateTime(modifiedAt);
	const encoder = new TextEncoder();

	const prepared = entries.map((entry) => {
		const name = encoder.encode(entry.name);
		return {
			name,
			data: entry.data,
			crc: crc32(entry.data),
			// Bit 11 signalisiert UTF-8-Dateinamen; bei reinem ASCII schadet es nicht.
			flags: UTF8_FLAG
		};
	});

	const localSize = prepared.reduce(
		(sum, entry) => sum + LOCAL_HEADER_SIZE + entry.name.length + entry.data.length,
		0
	);
	const centralSize = prepared.reduce(
		(sum, entry) => sum + CENTRAL_HEADER_SIZE + entry.name.length,
		0
	);

	const archive = new Uint8Array(localSize + centralSize + END_OF_CENTRAL_DIR_SIZE);
	const view = new DataView(archive.buffer);
	const u16 = (offset: number, value: number) => view.setUint16(offset, value, true);
	const u32 = (offset: number, value: number) => view.setUint32(offset, value, true);

	const offsets: number[] = [];
	let cursor = 0;

	for (const entry of prepared) {
		offsets.push(cursor);

		u32(cursor, LOCAL_HEADER_SIGNATURE);
		u16(cursor + 4, VERSION_NEEDED);
		u16(cursor + 6, entry.flags);
		u16(cursor + 8, METHOD_STORE);
		u16(cursor + 10, dosTime);
		u16(cursor + 12, dosDate);
		u32(cursor + 14, entry.crc);
		u32(cursor + 18, entry.data.length);
		u32(cursor + 22, entry.data.length);
		u16(cursor + 26, entry.name.length);
		u16(cursor + 28, 0);
		cursor += LOCAL_HEADER_SIZE;

		archive.set(entry.name, cursor);
		cursor += entry.name.length;

		archive.set(entry.data, cursor);
		cursor += entry.data.length;
	}

	const centralDirectoryOffset = cursor;

	for (const [index, entry] of prepared.entries()) {
		u32(cursor, CENTRAL_HEADER_SIGNATURE);
		u16(cursor + 4, VERSION_NEEDED);
		u16(cursor + 6, VERSION_NEEDED);
		u16(cursor + 8, entry.flags);
		u16(cursor + 10, METHOD_STORE);
		u16(cursor + 12, dosTime);
		u16(cursor + 14, dosDate);
		u32(cursor + 16, entry.crc);
		u32(cursor + 20, entry.data.length);
		u32(cursor + 24, entry.data.length);
		u16(cursor + 28, entry.name.length);
		u16(cursor + 30, 0);
		u16(cursor + 32, 0);
		u16(cursor + 34, 0);
		u16(cursor + 36, 0);
		u32(cursor + 38, 0);
		u32(cursor + 42, offsets[index]);
		cursor += CENTRAL_HEADER_SIZE;

		archive.set(entry.name, cursor);
		cursor += entry.name.length;
	}

	u32(cursor, END_OF_CENTRAL_DIR_SIGNATURE);
	u16(cursor + 4, 0);
	u16(cursor + 6, 0);
	u16(cursor + 8, prepared.length);
	u16(cursor + 10, prepared.length);
	u32(cursor + 12, centralSize);
	u32(cursor + 16, centralDirectoryOffset);
	u16(cursor + 20, 0);

	return archive;
};
