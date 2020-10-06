import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Button, TextField, GridListTile , GridList, Paper,} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import loading from './loading.gif';

const useStyles = makeStyles({
  cardRoot: {
    minHeight:136
  },
  button: {
    margin: 'auto',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    width: '90%',
    margin:'auto !important' ,
  },
  name:{
    minHeight:50,
  },
  formRecipe:{
    marginLeft:10,
    marginRight:10
  },
  formIngredient:{
    margin:20
  },
  recipeContainer:{
    margin:'auto', 
    width:'90%'
  },
  areYouSure:{
    clear:'both',
    fontSize:15,
    color:'red',
    marginTop:20
  },
  goBack:{
    marginTop:30
  },
  actionButtons:{
    minWidth:40,
  },
  recipeNameEdit:{
    fontSize: 14 , 
  },
  show:{
    display:'inline-block',
  },
  hidden:{
    display:'none'
  }
});


export default function RecipeApp(props) {
  const classes = useStyles();
  let [theDisplayBoolean, setDisplayBoolean] = React.useState(true);
  const [individualRecipe, setIndividualRecipe] = React.useState(<div>filler</div>);
  const [recipeName, setRecipeName] = React.useState(<div>filler</div>);
  let [newRecipe, setNewRecipe] = React.useState(false);
  let [newIngredient] = React.useState(false);
  let [editRecipe] = React.useState(false);
  let [submitting] = React.useState(false);

  //adding a new recipe form component
  //used for POST and PATCH 
  class NewRecipeForm extends React.Component {
    constructor(props) {
      super(props);  
      if (props['props'].action){ //if there is an action then we are editing, otherwise adding
        this.state = {
                    name:props['props'].name, 
                    id:props['props'].identifier, 
                    action: props['props'].action,
                    error:false
                    }
      } else{
        this.state = {
                      name:'',
                      action:'POST',
                      id:'',
                      error:false
                    };
      }

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
      const target = event.target;
      const value = target.value;
      const name = target.name;  
      this.setState({
        [name]: value
      });
      this.setState({value: event.target.value});
    }
    async handleSubmit(event) {
      event.preventDefault();
      
      this.state.name==='' ? this.state.error=true : this.state.error = false;
      if (this.state.error ===true){
        this.setState({error: true})
      }
      if (!(this.state.error)){
        submitting=true;
        this.setState({error: false});//re-render
        let {action,id,error, ...data} = this.state; //don't want to use the action variable here or id
        let stringData = JSON.stringify(
              data
        );
        try {
          const response = await fetch(
            'https://radiant-hollows-75557.herokuapp.com/api/admin/recipe/' + this.state.id, {
            method: this.state.action,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: stringData
          }).then((response) => response.json())
              .then( async (json) =>{
                //get new recipe id and go to the ingredients view
                let newRecipeData = await getIndividualRecipe(json['data']['identifier']);
                newIngredient=false;
                editRecipe = false;
                submitting=false;
                newRecipe=true;
                showIndividualRecipe(newRecipeData['data']);
              });
            console.log(response);
        } catch (error) {
          console.error(error);
        }
      } else{

      }
    }

    render() {
      return (
        <form className={editRecipe ? classes.formIngredient : classes.formRecipe} onSubmit={this.handleSubmit}>
            <TextField error={this.state.error} helperText={(this.state.error ? 'Cannot Be blank' : this.state.error)} size='small' name="name" value={this.state.name} onChange={this.handleChange}  label="Recipe Name" variant="outlined" />
            {submitting ? <div style={{textAlign:'center'}}><img style={{width:50}} src={loading} alt="loading" /></div>
            :
              <div><Button type="submit" value="Submit" onClick = {this.handleSubmit} size='small'> Submit </Button>
                {editRecipe ? 
                  <Button onClick={()=>{let {action,id, ...data} = this.props; cancelAction(data);}}>Cancel</Button>
                  :
                  <div></div>
                }
              </div>
            } 
            </form>
      );
    }
  }

  //creates the form for adding, editing, deleting ingredients
  class AddIngredientsForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
                    name:'',
                    calories:'',
                    weight:'',
                    recipe:props['props']['identifier'], //recipe id
                    action:props['props']['action'],
                    id:props['props']['id'], //ingredient id
                    errors:{
                      name:false,
                      calories:false,
                      weight:false,
                    }
      };
      if (props['props']['action']==='PATCH'){
        this.state.name=props['props']['ingredList']['name']
        this.state.calories=props['props']['ingredList']['calories']
        this.state.weight=props['props']['ingredList']['weight']
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
      const target = event.target;
      const value = target.value;
      const name = target.name;
      this.setState({
        [name]: value
      });
    }
    async handleSubmit(event) {
      event.preventDefault();
      //error checking
      this.state.name==='' ? this.state.errors.name = true : this.state.errors.name = false;
      (this.state.calories>=0 && this.state.calories!=='') ? this.state.errors.calories = false : this.state.errors.calories = true;
      (this.state.weight>=0 && this.state.weight!=='') ? this.state.errors.weight = false : this.state.errors.weight = true;

      //if we have no errors, do the API call
      if (!(this.state.errors.name || this.state.errors.calories || this.state.errors.weight)){
        this.state.errors.name = false;
        this.state.errors.calories = false;
        this.state.errors.weight = false;
        submitting=true;
        showIndividualRecipe(this.props['props']);
        let {action,id,errors, ...data} = this.state; //don't want to use the action variable here or id
        let stringData = JSON.stringify(
              data
            );
        try {
          const response = await fetch(
            'https://radiant-hollows-75557.herokuapp.com/api/admin/ingredient/'+this.state.id, {
            method: this.state.action,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: stringData
          });
          console.log(response.json());
          let newRecipeData = await getIndividualRecipe(data['recipe']);
          newIngredient=false;
          submitting=false;
          showIndividualRecipe(newRecipeData['data']);
        } catch (error) {
          console.error(error);
        }
      } else{
        //re render our component with error msgs
        showIndividualRecipe(this.props['props']);
      }
    }
    async deleteIngredient(id){
      submitting=true;
      showIndividualRecipe(this.props['props']);
      try {
            const response = await fetch(
              'https://radiant-hollows-75557.herokuapp.com/api/admin/ingredient/' + id + '/', {
              method: 'DELETE',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              }
            })
            console.log(response.json());
            let newRecipeData = await getIndividualRecipe(this.state.recipe);
            newIngredient=false;
            submitting=false;
            showIndividualRecipe(newRecipeData['data']);
          } catch (error) {
            console.error(error);
          }
    }

    render() {
      if (this.state.action==='DELETE'){
        return ( <div>
          <div className={classes.areYouSure}>Are you sure you want to delete this ingredient?</div>
          {submitting ? <div style={{textAlign:'center'}}><img style={{width:50}} src={loading} alt="loading" /></div>
            : 
            <div>
              <Button onClick={()=>{this.deleteIngredient(this.state.id);}}>Delete</Button>
              <Button onClick={()=>{let {action,id, ...data} = this.props;  cancelAction(data);}}>Cancel</Button>
            </div>
          }
          </div> )
      } else{
        return (
          <form>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                  <TableBody>
                    <TableRow key='addNewIngredientForm'>
                      <TableCell  component="th" scope="row">
                        <TextField error={this.state.errors.name } helperText={(this.state.errors.name ? 'Cannot Be blank' : this.state.errors.name)} size='small' name="name" value={this.state.name} onChange={this.handleChange}  label="Name" variant="outlined" />
                      </TableCell>
                      <TableCell align="right"><TextField error={this.state.errors.calories} helperText={(this.state.errors.calories ? 'Must be >= 0' : this.state.errors.calories)} size='small' name="calories" value={this.state.calories} onChange={this.handleChange}  label="Calories" variant="outlined" /></TableCell>
                      <TableCell align="right"><TextField style={{display:'none'}} size='small' name="recipe" value={this.state.recipe} label="id" variant="outlined" />
                        <TextField error={this.state.errors.weight } helperText={(this.state.errors.weight ? 'Must be >= 0' : this.state.errors.weight)} size='small' name="weight" value={this.state.weight} onChange={this.handleChange}  label="Weight (g)" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        {submitting ? <div style={{width:80}}><img style={{width:50}} src={loading} alt="loading" /></div>
                          :
                        <div><Button className={(submitting ? classes.hidden : classes.show)} type="submit" value="Submit" onClick = {this.handleSubmit} size='medium'> 
                          {this.state.action ==='PATCH' ? ('Edit') : ('Submit')} 
                        </Button>
                        <Button className={(submitting ? classes.hidden : classes.show)} onClick={()=>{let {action,id, ...data} = this.props;  cancelAction(data);}}>Cancel</Button></div>
                        }
                      </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </form>
        );
      }
    }
  }

  //helper functions 
  async function getIndividualRecipe(id){
    try {
          const response = await fetch(
            'https://radiant-hollows-75557.herokuapp.com/api/admin/recipe/'+id, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          })
          return(response.json());
        } catch (error) {
          console.error(error);
        }
  }
  const showAllRecipes= async ()=>{
    if (newRecipe){
      window.location.reload();//reload main page to get new data
    }else{
      setDisplayBoolean(true);
    }
  }
  const editRecipeName = async (props, action)=>{
    editRecipe = true;
    props.action = action;
    showRecipeName(props);
  }
  const addIngredient =(props, action, id='', ingredList)=>{
    newIngredient = true;
    props.action = action;
    props.id=id;
    props.ingredList = ingredList;
    showIndividualRecipe(props);
  }
  const cancelAction = (props)=>{
    newIngredient=false;
    editRecipe=false;
    setNewRecipe(false);
    showIndividualRecipe(props['props']);
  }

  const showRecipeName = (props)=>{
    setRecipeName(
      <div className={classes.name}>
        {editRecipe ? 
          <NewRecipeForm props={props} /> 
        :
          <h3>{props.name}
            <Button className={classes.actionButtons} onClick={()=>{editRecipeName(props, 'PATCH');}} > 
              <EditIcon className={classes.recipeNameEdit} /> 
            </Button>
          </h3>
        }
      </div>
      );
  }
  //here is where we create and show the individual recipes
  const showIndividualRecipe = (props)=> {
    setDisplayBoolean(false);
    showRecipeName(props);
    let totalCalories = 0;
    for (let i =0; i < props.ingredient.length;i++){
      totalCalories += parseInt(props.ingredient[i]['calories'])
    }
    setIndividualRecipe(
      <div>
        <div style={{ fontSize: 12 }}>Total calories: {totalCalories}</div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Ingredient Name</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Weight&nbsp;(g)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.ingredient.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.calories}</TableCell>
                  <TableCell align="right">{row.weight}</TableCell>
                  <TableCell align="right" >
                    <Button className={classes.actionButtons} onClick={()=>{
                                                              addIngredient(props, 'PATCH',row.identifier,row);
                                                              
                                                              //newIngredient=false;
                                                            }}>
                      <EditIcon  />
                    </Button>
                    <Button className={classes.actionButtons} onClick={()=>{
                                                              addIngredient(props, 'DELETE',row.identifier)
                                                            }}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
              {newIngredient ?  //show the form if they are editing, adding or deleting
                  <AddIngredientsForm props={props}/> 
                  
                :
                  //otherwise show the add new ingredient option
                  (<TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableBody>
                        <TableRow key='addNew'>
                          <TableCell  component="th" scope="row">
                            <Button onClick={()=>{addIngredient(props, 'POST')}} >Add New Ingredient <AddCircleOutlineIcon style={{marginRight:10}}/></Button>
                          </TableCell>
                          <TableCell align="right"></TableCell>
                          <TableCell align="right"></TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              }
        <Button className={classes.goBack}onClick={()=>{showAllRecipes()}}>Go back and see all Recipes</Button>
      </div>
    );
  }

  //Here is where we create all the recipes. 
  //Use a map function to apply the data for each recipe
  const displayRecipes = props.allRecipes.map((recipe) =>
      <GridListTile key={recipe.identifier}>
        <Card className={classes.cardRoot} variant='outlined'>
          <CardContent>
            <Typography className={classes.title}  variant="h5" component="h2">
              {recipe.name}
            </Typography>
          </CardContent>
          <CardActions>
            <Button onClick = {()=>showIndividualRecipe(recipe)}  className={classes.button} size="small">See Recipe</Button>
          </CardActions>
        </Card>
      </GridListTile>
    );

  // Here's where we return the view for the content
  if (theDisplayBoolean){ // show all recipes
    return (
      <GridList cellHeight={180} className={classes.gridList}>
      <GridListTile>
          <Card className={classes.cardRoot} variant='outlined'>
            <CardContent>
              <Typography variant="h5" component="h2">
              {newRecipe ? //show the form on the main recipe page
                  (<NewRecipeForm props={props}/>) 
                  : //otherwise show the add recipe button
                  (<CardActions onClick = {()=>{setNewRecipe(true)}}>
                      <Button className={classes.button} size="small">
                        <AddCircleOutlineIcon fontSize='small' style={{marginRight:10}}/>  New Recipe
                      </Button>
                  </CardActions>)
              }
              </Typography>
            </CardContent>
          </Card>
      </GridListTile>
          {displayRecipes}
      </GridList>
    );
  }else{    //show individual recipe
    return (
      <div className = {classes.recipeContainer}>
        {recipeName}
        {individualRecipe}
      </div>
      )
  }
}
