// A random() stand-in that always rolls the same value.
export const always = (value: number) => () => value;
