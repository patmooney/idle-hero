export const store = (name: string, val: Object | number | string) => {
    if (typeof val === "object") {
        val = JSON.stringify(val);
    }
    return window.localStorage.setItem(name, `${val}`)
}

export const unstore = <T>(name: string): T | undefined => {
    const val = window.localStorage.getItem(name);
    if (!val) {
        return (val as T) ?? undefined;
    }
    try {
        return JSON.parse(val!) as T;
    } catch(err) {
        return val as T;
    }
}
