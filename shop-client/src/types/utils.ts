export type ObjectPropertyString<T> = {
    [PropertyKey in keyof T]?: string;
};
