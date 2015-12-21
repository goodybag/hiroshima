/* globals describe, it, context */
import expect from 'expect';

import {Router} from '../src/router';

class MainComponent {
    static route(router) {
        router.dir('locations').param('location_id').use(LocationComponent);
    }
}

class LocationComponent {
    static route(router) {
        router.index(LocationMenuComponent);
        router.dir('info').index(LocationInfoComponent);
        router.dir('reviews').index(LocationReviewsComponent);
    }
}

class LocationMenuComponent {}
class LocationInfoComponent {}
class LocationReviewsComponent {}

describe('Router', function() {
    context('when empty', function() {
        const router = new Router();

        it('should not match anything', function() {
            const result = router.match('/locations/111/info');

            expect(result.components).toEqual([]);
            expect(result.params).toEqual({});
        });
    });

    context('when a root handler is defined', function() {
        const router = new Router().index('the handler value');

        it('should match that handler on root', function() {
            const result = router.match('/');

            expect(result.components).toEqual(['the handler value']);
        });

        it('should not match that handler on other routes', function() {
            const result = router.match('/foo');

            expect(result.components).toEqual([]);
        });
    });

    it('should handle routes', function() {
        const router = new Router().call(function(router) {
            router.use(MainComponent);
        });

        const result = router.match('/locations/111/info');

        expect(result.components).toEqual([
            MainComponent,
            LocationComponent,
            LocationInfoComponent
        ]);

        expect(result.params.location_id).toBe('111');
    });

    describe('.param', function() {
        const router = new Router();

        router.param('p', function(arg) {
            const result = parseInt(arg);

            if (isNaN(result)) {
                return null;
            } else {
                return result;
            }
        }).index('sentinel');

        it('should parse path segments', function() {
            expect(router.match('/123').params.p).toBe(123);
        });

        it('should skip routes when the parser fails', function() {
            expect(router.match('/foo').components).toEqual([]);
        });
    });

    describe('.else', function() {
        const router = new Router();

        router.index('foo');
        router.dir('something').index('bar');
        router.else('fallback');

        it('should not fallback postmaturely', function() {
            expect(router.match('/').components).toEqual(['foo']);
            expect(router.match('/something').components).toEqual(['bar']);
        });

        it('should fallback when root route fails', function() {
            expect(router.match('/foo').components).toEqual(['fallback']);
        });

        it('should fallback for nested routes', function() {
            expect(router.match('/something/bar').components).toEqual(['fallback']);
            expect(router.match('/foo/quux').components).toEqual(['fallback']);
        });
    });

    describe('.where', function() {
        const router = new Router();

        router.dir('foo').where({method: 'get'}).index('GET /foo');
        router.dir('bar').where(({query}) => query.baz === 'quux').index('GET /bar?baz=quux');

        it('should work with object matchers', function() {
            expect(router.match('/foo', {method: 'get'}).components).toEqual(['GET /foo']);
            expect(router.match('/foo', {method: 'post'}).components).toEqual([]);
            expect(router.match('/foo', {}).components).toEqual([]);
        });

        it('should skip routes when the parser fails', function() {
            expect(router.match('/bar', {query: {baz: 'quux'}}).components).toEqual(['GET /bar?baz=quux']);
            expect(router.match('/bar', {query: {baz: 'foo'}}).components).toEqual([]);
            expect(router.match('/bar', {query: {}}).components).toEqual([]);
            expect(() => router.match('/bar')).toThrow(TypeError);
        });
    });

    describe('routing helpers', function() {
        const router = new Router();

        router.get('list');
        router.post('create');
        router.param('id').call(router => {
            router.get('show');
            router.put('replace');
            router.patch('update');
            router.delete('remove');
            router.options('all of them');
        });

        describe('.get', function() {
            it('should work', function() {
                expect(router.match('/', {method: 'get'}).components).toEqual(['list']);

                expect(router.match('/foo', {method: 'get'}).components).toEqual(['show']);
            });
        });

        describe('.post', function() {
            it('should work', function() {
                expect(router.match('/', {method: 'post'}).components).toEqual(['create']);
            });
        });

        describe('.put', function() {
            it('should work', function() {
                expect(router.match('/foo', {method: 'put'}).components).toEqual(['replace']);
            });
        });

        describe('.patch', function() {
            it('should work', function() {
                expect(router.match('/foo', {method: 'patch'}).components).toEqual(['update']);
            });
        });

        describe('.delete', function() {
            it('should work', function() {
                expect(router.match('/foo', {method: 'delete'}).components).toEqual(['remove']);
            });
        });


        describe('.options', function() {
            it('should work', function() {
                expect(router.match('/foo', {method: 'options'}).components).toEqual(['all of them']);
            });
        });
    });
});
