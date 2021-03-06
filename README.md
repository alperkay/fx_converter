# fx_converter

This is a web app to convert currencies. Data is borrowed from the [Exchange Rates Api](https://exchangeratesapi.io/) .

## Notes for further development considerations:

- Drew ui inspiration from Google, DuckDuckGo and TransferWise FX converters. (Google also doesn't deal with large numbers. TransferWise doesn't inform user for errors coming from the server).
- Mobile first approach in terms of design.
- There's no visual feedback that user has to scroll horizontally for the added currencies.
- Proper rounding of decimals is missing.
- This app doesn't deal with proper displaying of large numbers since Javascript's Number primitive has limitations. This can be solved with custom functionality.
- There's no thousand separators for easier reading.
- Vue Router can be used to set url query params after user actions, so that the resulting url can be shareable and fetches automatically based on the params.
- As it is know, exchange rates are fetched in 3 cases:
  - when any of the selected currencies is changed
  - when date is changed
  - when user agent goes offline first, then goes online and user makes any change on any field
    The reason is mainly to keep the data fetching to minimum while making sure that correct exchange rates are always applied.
- Local storage can be used to keep exchange rates for a day (rates are published on a daily basis) to avoid unnecessary requests.
- Invalid data input prevention can be improved for Firefox and Safari.
- Native HTML date input doesn't have a date picker on Safari. Custom one can be made.
- For now, usage of Vuex seems unnecessary as there's only one view and limited number of components.
- Some unit and E2E tests are missing.
- Debouncing can be added. 
- A chart showing the historical rates is added (in the chart branch for now). The functionality works properly, but user experience (especially for mobile) should be investigated further.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Run your end-to-end tests

```
npm run test:e2e
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
