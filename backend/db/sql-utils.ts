export function insertStatement(
	tableName: string,
	columnValueMap: Record<string, any>
) {
	const columns = Object.keys(columnValueMap);
	const values = Object.values(columnValueMap);
	const placeholders = columns.map(() => '?').join(', ');
	const sql = `INSERT INTO ${tableName} (${columns.join(
		', '
	)}) VALUES (${placeholders})`;

	return { sql, values };
}

export function updateStatement(
	tableName: string,
	columnValueMap: Record<string, any>,
	where: Record<string, any>
) {
	const columns = Object.keys(columnValueMap);
	const values = columns.map((key) => columnValueMap[key]);
	const fieldUpdates = columns.map((field) => `${field} = ?`).join(', ');
	const whereKeys = Object.keys(where);
	const whereValues = whereKeys.map((key) => where[key]);
	const whereClause = whereKeys.map((field) => `${field} = ?`).join(' AND ');
	const sql = `UPDATE ${tableName} SET ${fieldUpdates} WHERE ${whereClause}`;

	return { sql, values: [...values, ...whereValues] };
}

export function deleteStatement(tableName: string, where: Record<string, any>) {
	const whereKeys = Object.keys(where);
	const whereValues = whereKeys.map((key) => where[key]);
	const whereClause = whereKeys.map((field) => `${field} = ?`).join(' AND ');
	const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;

	return { sql, values: whereValues };
}
