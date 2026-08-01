import { test, expect } from '@playwright/test';

test.describe('GitHub Gists API - Create Public Gist', () => {

    test('POST /gists - Should successfully create a public gist and validate schema & response details', async ({ request }) => {
        const testFileName = 'test_sample.txt';
        const testFileContent = 'Hello, this is an automated test public gist!';
        const testDescription = 'Automated Test Public Gist';

        const payload = {
            description: testDescription,
            public: true,
            files: {
                [testFileName]: {
                    content: testFileContent,
                },
            },
        };

        // ACT: Send POST request to create Gist
        const response = await request.post('/gists', { data: payload });

        // ASSERT: Status Code 201 Created
        expect(response.status()).toBe(201);

        const responseBody = await response.json();

        // 1. Validate 'id'
        expect(responseBody.id).toBeDefined();
        expect(typeof responseBody.id).toBe('string');
        expect(responseBody.id.length).toBeGreaterThan(0);

        // 2. Validate 'public' flag
        expect(responseBody.public).toBe(true);

        // 3. Validate 'description'
        expect(responseBody.description).toBe(testDescription);

        // 4. Validate file structure and content
        expect(responseBody.files).toBeDefined();
        expect(responseBody.files[testFileName]).toBeDefined();
        expect(responseBody.files[testFileName].filename).toBe(testFileName);
        expect(responseBody.files[testFileName].content).toBe(testFileContent);

        // 5. Validate 'owner' object details
        expect(responseBody.owner).toBeDefined();
        expect(responseBody.owner.login).toBeDefined();
        expect(typeof responseBody.owner.login).toBe('string');
        expect(responseBody.owner.id).toBeGreaterThan(0);
        expect(responseBody.owner.url).toContain('https://api.github.com/users/');

        // TEARDOWN: Clean up created Gist
        const deleteResponse = await request.delete(`/gists/${responseBody.id}`);
        expect(deleteResponse.status()).toBe(204);
    });

});