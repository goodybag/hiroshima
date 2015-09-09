export default class Router {
    constructor() {
        this.handler = null;
        this.children = [];
    }

    index(handler) {
        this.children.push(function(segments) {
            if (segments.length === 0) {
                return new MatchResult([handler], {});
            } else {
                return new FailedMatchResult();
            }
        });

        return this;
    }

    else(handler) {
        this.children.push(function(segments) {
            return new MatchResult([handler], {});
        });

        return this;
    }

    run(segments) {
        for (let child of this.children) {
            let result = child(segments);

            if (result instanceof FailedMatchResult) {
                continue;
            } else {
                return result;
            }
        }

        return new FailedMatchResult([], {});
    }

    dir(segment) {
        const router = new Router();

        this.children.push(function(segments) {
            if (segment === segments[0]) {
                return router.run(segments.slice(1));
            } else {
                return new FailedMatchResult();
            }
        });

        return router;
    }

    param(param, parser = passthrough) {
        if (parser instanceof RegExp) {
            let regex = parser;

            parser = function(segment) {
                const result = regex.match(segment);

                if (result == null) {
                    return null;
                } else {
                    return result[0];
                }
            };
        }

        const router = new Router();

        this.children.push(function(segments) {
            if (segments[0] != null) {
                const result = parser(segments[0]);

                if (result != null) {
                    return router.run(segments.slice(1)).withParam(param, parser(segments[0]));
                } else {
                    return new FailedMatchResult();
                }
            } else {
                return new FailedMatchResult();
            }
        });

        return router;
    }

    call(fn) {
        fn(this);

        return this;
    }

    group(handler) {
        const router = new Router();

        this.children.push(function(segments) {
            return router.run(segments).withComponent(handler);
        });

        return router;
    }

    use(handler) {
        return this.group(handler).call(handler.route || function() {});
    }

    match(path) {
        const segments = path.split('/').filter(x => x);

        const result = this.run(segments);

        if (result) {
            return result;
        } else {
            return new MatchResult([], {});
        }
    }
}

export class MatchResult {
    constructor(components, params) {
        this.components = components;
        this.params = params;
    }

    withParam(param, value) {
        const {components, params} = this;

        return new MatchResult(components, {[param]: value, ...params});
    }

    withComponent(component) {
        const {components, params} = this;

        return new MatchResult([component, ...components], params);
    }
}

export class FailedMatchResult extends MatchResult {
    withParam() {
        return this;
    }

    withComponent() {
        return this;
    }
}

function passthrough(arg) {
    return arg;
}
