# go.grid : Data Grid - Angular Directive

Grid directive for turning data into scrollable, filterable and sortable table.

It's far from complete. Number of things must be done.


# Features

- sortable
- resizable
- cell templating
- checkbox column for group operations
- filterable
- column hiding
- column reordering
- Excel export
- column status kept in localStorage

# Installing

Use bower if you like or just download builds (js and css)
    > bower install go.grid

# Building


Install dependencies

    # Install grunt-cli if haven't yet installed:
    > npm install -g grunt-cli

    # Install node modules
    > npm install
    # Install bower components (to have example working)
    > bower install

Default grunt task will build files into build/ and run watcher
    > grunt

Build task wil only build
    > grunt build


# Dependencies
- angular: "~1.2.24",
- bootstrap: "~3.2.0",
- angularLocalStorage: "~0.1.7",
- angular-cookies: "~1.2.24",
- font-awesome: "~4.2.0",
- jquery-ui: "~1.11.1" (for resizable columns)


# TODO

Very important thing - HOW TO USE IT? - for start see example/index.html