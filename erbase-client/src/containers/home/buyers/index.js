import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import BuyersMainPage from './main'
import BuyersCreatePage from './create'
import swal from 'sweetalert'

class Buyers extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: []
        };
    }

    componentDidMount = () => {
        this.updateBuyers();
    }

    updateBuyers = () => {
        Api.get('/buyers')
        .then(data => {
            this.setState({ data: data.value || [] });
        });
    }

    tableHandler = (action, value) => {
        console.log(action, value)
    }

    rowHighlighter = (data) => {
        //return 'green';
    }

    onUserCreated = (user, isEdit) => {
        let query;

        if(isEdit) {
            query = Api.put('/buyers', user);
        }
        else {
            query = Api.post('/buyers', user);
        }
        
        query.then(out => {
            this.props.changePage('/buyers');
            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(out => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }
    
    render = () => {
        let location = this.props.location;

        return (
            <div>
                <Switch location={location}>
                    <Route path="/buyers/create" component={() => <BuyersCreatePage onUserCreated={this.onUserCreated}/>} />
                    { this.props.buyer.data.id && <Route path="/buyers/edit" component={() => <BuyersCreatePage isEdit={true} onUserCreated={this.onUserCreated}/>} /> }
                    <Route path="/buyers" component={() => <BuyersMainPage data={this.state.data} updateBuyers={this.updateBuyers} rowHighlight={this.props.rowHighlight} />} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = ({ user, buyer }) => ({
    user,
    buyer
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Buyers)
