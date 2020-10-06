import React from 'react';
import './App.css';
import loading from './loading.gif';
import RecipeApp from './Card.js'



class AllRecipes extends React.Component {
  state = {
    externalData: null,
  };

  async componentDidMount() {
      const externalData = await this.fetchRecipes();
      this.setState({ externalData });
  }
  async fetchRecipes(){
    try {
    const response = await fetch(
      'https://radiant-hollows-75557.herokuapp.com/api/admin/recipe/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    return response.json();
  } catch (error) {
    console.error(error);
  }

  }
  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }
  should
  render() {
    if (this.state.externalData === null) {
      // Render loading state ...
      return(<div><img style={{width:50}} src={loading} alt="loading" /></div>);
    } else {
      // Render real UI ...
      return(<RecipeApp allRecipes={this.state.externalData['data']} />);
    }
  }
}



function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <h2>
          A Basic Recipe App
        </h2>
      </header>
      <content style={{margin:'auto', width:'50%'}}>
        <AllRecipes />
      </content> 
    </div>
  );

}

export default App;

