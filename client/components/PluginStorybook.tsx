import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure({
  hideProgressBar: true
});

export class PluginStorybook extends React.Component {
  state = {
    dummyText: '',  /* value of text input */
  }

  handleToasterSubmit(text: string) {

    if (text) toast.success(text);
    else  toast.error('Empty text');
  }

  render() {
    const { dummyText } = this.state;

    return (
      <React.Fragment>
        <h1>React Sample</h1>

        Type Text Here:
        <br />
        <input type='text' className='input-sm' value={dummyText} onChange={(e) => this.setState({ dummyText: e.target.value })} />
        <br />
        <br />

        It will replicate here:
        <br />
        <label id='l1'>{dummyText}</label>
        <br />
        <br />

        Click Submit to see Toaster:<br />
        <input type='submit' value='Go!' onClick={() => this.handleToasterSubmit(dummyText)} />
      </React.Fragment>
    );
  }
}
