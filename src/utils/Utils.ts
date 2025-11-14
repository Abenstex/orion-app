export function generateRandomString(length: number): string {
    const random = Math.random();
    let result = '';
    for (let i = 0; i < length; i++) {
        result += String.fromCharCode(Math.floor(random * 26) + 65);
    }
    return "Orion.Client" + result;
}

export function toReadableDateTime(millisAsString: string | undefined): string {
    if (millisAsString == undefined || millisAsString.length == 0) {
        return "";
    }
    let millis = Number.parseInt(millisAsString);

    return new Date(millis).toLocaleDateString();
}
