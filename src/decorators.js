export function router(fn) {
    return decorator;

    function decorator(target) {
        target.route = fn;
    }
}
