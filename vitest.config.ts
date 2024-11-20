import { defineConfig } from 'vitest/config';
import { config } from "dotenv";
config()

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        sequence: {
            concurrent: false
        },
        poolOptions: {
            threads: {
                singleThread: true
            }
        }
    },
});
