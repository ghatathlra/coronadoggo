function tage(tag, err) {
    if (typeof tag !== 'string') {
        tag = 'UNKNOWN_TAG';
    }
    err.message = `${tag} ${err.message}`
    return err;
}

module.exports = {tage};