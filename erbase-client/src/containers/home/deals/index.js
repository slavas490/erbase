import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import DealsMainPage from './main'
import DealsCreatePage from './create'
import swal from 'sweetalert'

import './style.scss'

class Ads extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: [],
        };
    }

    componentDidMount = () => {
        this.updateDeals();
    }

    updateDeals = () => {
        Api.get('/deals')
        .then(data => {
            this.setState({ data: data.value || [] });
        });
    }

    tableHandler = (action, value) => {
        console.log(action, value)
    }
    
    onDealCreated = (data, isEdit) => {
        let query;

        if(isEdit) {
            query = Api.put('/deals', data);
        }
        else {
            query = Api.post('/deals', data);
        }
        
        query.then(out => {
            this.props.changePage('/deals');
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
                    <Route path="/deals/create" component={() => <DealsCreatePage onDealCreated={this.onDealCreated}/>} />
                    { this.props.deal.data.id && <Route path="/deals/edit" component={() => <DealsCreatePage isEdit={true} onDealCreated={this.onDealCreated}/>} /> }
                    <Route path="/deals" component={() => <DealsMainPage data={this.state.data} notes={this.state.notes} updateDeals={this.updateDeals} rowHighlight={this.props.rowHighlight} />} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = ({ user, router, deal }) => ({
    user,
    deal,
    location: router.location
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
)(Ads)
