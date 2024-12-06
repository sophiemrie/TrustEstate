# TrustEstate
Repository for our Blockchain project "TrustEstate"

## Install dependencies

```bash
npm install
npm --prefix frontend install
```

## Running the development environment

```bash
npm start
```

The frontend will be served at http://localhost:3000 and the hardhat node will be running at http://localhost:8545.

## Running tests

```bash
npm test
```

You can also run the tests in watch mode.

```bash
npm run test:watch
```

## Running gas tests

You can run gas tests by setting the `REPORT_GAS` environment variable to `true` or by running the following command.

```bash
npm run test:gas
```


