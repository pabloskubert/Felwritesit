let itVar: Object;

const isDefined = function(obj: Object) {
    const is = obj !== undefined && obj !== null && obj !== '';
    itVar = (is)? obj : it;
    return is;
}

const it = () => itVar;
export {it, isDefined };
