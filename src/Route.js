export class Route {
    constructor(attrs) {
        const {
            href = null,
            path = null,
            query = {},
            params = {}
        } = attrs;

        this.href = href;
        this.path = path;
        this.query = query;
        this.params = params;
    }
}
