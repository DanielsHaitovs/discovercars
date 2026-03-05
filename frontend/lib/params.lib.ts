export function appendArrayParams(params: URLSearchParams, key: string, values?: string[] | null | undefined) {
    if (!values) return;

    for (const value of values) {
        if (value) {
            params.append(key, value);
        }
    }
}