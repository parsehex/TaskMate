import { File } from '../../shared/types';
import { FilesMessageHandlers } from '../../shared/types/ws';
import { getSession } from '.';

async function GET_FILE(fileId: number) {
	const session = getSession();
	return (await session.call('GET_FILE', [fileId])) as File;
}
async function GET_FILES(project_id: number | undefined) {
	const session = getSession();
	return (await session.call('GET_FILES', [project_id])) as File[];
}
async function CREATE_FILE(project_id: number, name: string) {
	const session = getSession();
	return (await session.call('CREATE_FILE', [project_id, name])) as File;
}
async function UPDATE_FILE(id: number, file: Partial<File>) {
	const session = getSession();
	return (await session.call('UPDATE_FILE', [id, file])) as File;
}
async function UPDATE_FILES(files: Partial<File>[]) {
	const session = getSession();
	return (await session.call('UPDATE_FILES', [files])) as File[];
}
async function DELETE_FILE(id: number) {
	const session = getSession();
	return (await session.call('DELETE_FILE', [id])) as void;
}

const FilesHandlers: FilesMessageHandlers = {
	GET_FILE,
	GET_FILES,
	CREATE_FILE,
	UPDATE_FILE,
	UPDATE_FILES,
	DELETE_FILE,
};

export default FilesHandlers;
