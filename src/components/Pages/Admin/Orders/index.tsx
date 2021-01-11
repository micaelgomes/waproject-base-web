import Toolbar from 'components/Layout/Toolbar';
import React, { FC, Fragment, memo } from 'react';

import ListOrderPage from './List';

const SamplePage: FC = memo(() => {
  return (
    <Fragment>
      <Toolbar title='Pedidos' />

      <ListOrderPage />
    </Fragment>
  );
});

export default SamplePage;
