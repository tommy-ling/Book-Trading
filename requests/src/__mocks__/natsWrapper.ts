export const natsWrapper = {
    client: {
        // mock the publish function so that we can test this publish method is actually invoked
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback();
        }),
    },
};
