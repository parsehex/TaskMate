import { File } from '../../shared/types';
import { FilesMessageHandlers } from '../../shared/types/ws';
import { call } from '.';

async function GET_FILE(fileId: string) {
	return (await call('GET_FILE', [fileId])) as File;
}
async function GET_FILES(project_id: string | undefined) {
	return (await call('GET_FILES', [project_id])) as File[];
}
async function CREATE_FILE(project_id: string, name: string) {
	return (await call('CREATE_FILE', [project_id, name])) as File;
}
async function UPDATE_FILE(id: string, file: Partial<File>) {
	return (await call('UPDATE_FILE', [id, file])) as File;
}
async function UPDATE_FILES(files: Partial<File>[]) {
	return (await call('UPDATE_FILES', [files])) as File[];
}
async function DELETE_FILE(id: string) {
	return (await call('DELETE_FILE', [id])) as void;
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
