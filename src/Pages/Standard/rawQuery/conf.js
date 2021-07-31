import RawQuery from './RawQuery';

const conf = {
      url: "raw",
      menuEntry: "Raw Query",
      pageTitle: "Raw Query",
      description: "Run GraphQL Queries against Proskomma",
      pageClass: RawQuery,
      state: [
          ['query', '{ id }'],
      ],
    };

export default conf;
