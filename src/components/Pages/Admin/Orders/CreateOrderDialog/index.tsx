import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from 'components/Shared/Fields/Text';
import { logError } from 'helpers/rxjs-operators/logError';
import { useFormikObservable } from 'hooks/useFormikObservable';
import { IOrder } from 'interfaces/models/order';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import orderService from 'services/order';
import userService from 'services/user';
import * as yup from 'yup';
import Toast from 'components/Shared/Toast';
import { tap } from 'rxjs/operators';
import { useObservable } from 'react-use-observable';

interface IProps {
  opened: boolean;
  order?: IOrder;
  onComplete: (order: IOrder) => void;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  description: yup.string().required().min(3).max(1020),
  amount: yup.number().required().positive().moreThan(0).max(2147483647, 'Por que precisa de tudo isso?'),
  value: yup.string().required()
});

const useStyle = makeStyles({
  content: {
    width: 600,
    overflowY: 'hidden',
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const CreateOrderDialog = memo((props: IProps) => {
  const classes = useStyle(props);
  const [data] = useObservable(() => userService.current(), []);
  const { id } = data || ({ id: null } as typeof data);

  const formik = useFormikObservable<IOrder>({
    validationSchema,
    onSubmit(model) {
      model.userId = id;
      model.amount = Number(model.amount);
      model.value = Number(model.value);

      return orderService.save(model).pipe(
        tap(order => {
          Toast.show(`${formik.values.id ? 'Atualizado com sucesso' : 'Pedido realizado'}`);
          props.onComplete(order);
        }),
        logError(true)
      );
    }
  });

  const handleEnter = useCallback(() => {
    formik.setValues(props.order ?? formik.initialValues, false);
  }, [formik, props.order]);

  const handleExit = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      onEnter={handleEnter}
      onExited={handleExit}
      TransitionComponent={Transition}
    >
      {formik.isSubmitting && <LinearProgress color='primary' />}

      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{formik.values.id ? 'Editar' : 'Realizar'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>
          <Fragment>
            <TextField
              label='Descrição do pedido'
              name='description'
              type='text'
              helperText='Limite de 1020 caracteres'
              fullWidth
              variant='outlined'
              formik={formik}
            />
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Quantidade'
                  name='amount'
                  type='number'
                  InputLabelProps={{
                    shrink: true
                  }}
                  formik={formik}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Valor'
                  name='value'
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>R$</InputAdornment>
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  formik={formik}
                />
              </Grid>
            </Grid>
          </Fragment>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel}>Cancelar</Button>
          <Button color='primary' variant='contained' type='submit' disabled={formik.isSubmitting}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default CreateOrderDialog;
