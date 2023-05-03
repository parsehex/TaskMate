I'm making a web app to make it easier to work on a multi-file project with ChatGPT. As I've used GPT Ive learned that, among other things, it's helpful to include the relevant files when asking to say expand functionality or to fix an issue. However as a project grows many files are added and managing the inclusion of relevant files/snippets is pretty inefficient for me right now.
I was thinking it would be nice to be able to point the app to a folder on the computer and it would stay in sync with the files in that folder. This would reduce the amount of work we need to do, as we can offload some of it onto the file system.
The prompt itself is another matter. The app should aid the iterative process that it is to make an application with ChatGPT. Depending on if you have anything already or are starting from scratch you'll need some sort of initial prompt where you describe the overall idea of the project. If you're starting fresh you'll need another prompt to go over the setup of the project. Besides these two, there will probably be quite a bit of variation but the iterative process should generally be to combine what you want to do and what you have now, and ask what you should do next to make progress toward your goal, then apply the response's suggestions at your descretion, check the results of the suggestions if applicable to include in your next prompt, and repeat the process using your updated project's state.
Each of these prompts probably have variations of them, and more snippets could be thought of to add to the iterative process, but this is a decent start.
This app is to be used with ChatGPT using the site's chat interface. The user will go back and forth between this app to construct a prompt, ChatGPT to get its response, and an editor of some sort (im using vscode) to edit the files which would be presented in the app to include in prompts.
The iterative process takes place across these various systems. The user is in charge of driving this process, as it's up to them which files to include in prompts and overall how to create the prompts, and they're expected to be actually taking the actions that they receive from ChatGPT (like running commands and updating files).

Currently I have a barebones Node server and React frontend with my dependencies installed.

Can you help me brainstorm an sql schema to use?

In backend folder I have:
routes/files.ts
routes/snippets.ts
database.ts
index.ts
server.ts
