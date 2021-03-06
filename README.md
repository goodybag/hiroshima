hiroshima [![Build Status](http://img.shields.io/travis/goodybag/hiroshima.svg?style=flat)](https://travis-ci.org/goodybag/hiroshima) [![NPM Version](http://img.shields.io/npm/v/hiroshima.svg?style=flat)](https://npmjs.org/package/hiroshima) [![License](http://img.shields.io/npm/l/hiroshima.svg?style=flat)](https://github.com/goodybag/hiroshima/blob/master/LICENSE)
=========

Hiroshima is a routing library inspired by the
[style of the D3.js monks](http://bost.ocks.org/mike/chart/), out of need for
a short-term working replacement for the great
[React Router](https://github.com/rackt/react-router). It is designed to be
simplistic and flexible while keeping the API clean and rigid.

Usage
-----

```js
import {Router} from 'hiroshima';

function routes(router) {
    router.group(App).call(function(router) {
        router.index(Home);

        router.dir('about').index(About);

        router.dir('users').call(function(router) {
            router.index(Users);
            router.param('user_id', /\d+/).index(User);
            router.else(BadUser);
        });

        router.else(NotFound);
    });
}

const router = new Router().call(routes);

router.match('/'); // {components: [App, Home]}
router.match('/about'); // {components: [App, About]}
router.match('/users'); // {components: [App, Users]}
router.match('/users/123'); // {components: [App, User], params: {user_id: '123'}}
router.match('/users/foo'); // {components: [App, BadUser]}
router.match('/foo'); // {components: [App, NotFound]}
```

Documentation
-------------

TODO
