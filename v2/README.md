# TaskMate v2 Setup

Artifacts generation succeeded, but dependency installation failed due to environment permission issues.

## Manual Setup

1.  **Fix Permissions**:
    ```bash
    sudo chown -R $(whoami) ~/.npm
    ```
2.  **Install Dependencies**:
    From the `v2` directory:
    ```bash
    pnpm install
    ```

## Project Structure

- `core/`: Shared logic and UI components.
- `web/`: The web-based SPA.
- `local/`: The local CLI/Server.
