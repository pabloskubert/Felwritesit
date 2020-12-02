
const getBID = function getById(ID: string) {
    return document.getElementById(ID);
}

const getBCLS = function getByClassName(CLASS_NAME: string) {
    const doc = document.getElementsByClassName(CLASS_NAME)[0];

    if (doc instanceof HTMLInputElement) {
        return doc.value;
    }

    return doc;
}

export {getBID, getBCLS};
