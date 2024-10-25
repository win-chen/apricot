const defaultAlert = "Uh oh, unforseen error has occured.";

export const handleError = (error: unknown, displayMsg = defaultAlert) => {
    if (typeof error === "string") {
        console.log(error);
    } else if (error instanceof Error) {
        console.log(error.message);
    } else {
        console.log(`Error was thrown with unknown format: ${JSON.stringify(error)}`);
    }
    // TODO: Disable in dev mode, enable in prod
    // alert(displayMsg);
}

// TODO: Handle multiple error types:
// user error - maybe get stats
// fatal runtime error, affects UIUX - crash with link to log
// non fatal error, ex. failed retriable requests, misconfigurations that don't affect UIUX - send to warning logs