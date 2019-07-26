import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import SellersMainPage from './main'
import SellersCreatePage from './create'
import swal from 'sweetalert'

class Sellers extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            data: []
        };
    }

    componentDidMount = () => {
        this.updateSellers();
    }

    updateSellers = () => {
        Api.get('/sellers')
        .then(data => {
            this.setState({ data: data.value || [] });
        });
    }

    onUserCreated = (user, isEdit) => {
        let form = new FormData(),
            dataKeys = Object.keys(user.data),
            fileKeys = Object.keys(user.files),
            query;
            
        for(let i=0; i<dataKeys.length; i++) {
            form.append(dataKeys[i], user.data[dataKeys[i]]);
        }

        for(let i=0; i<fileKeys.length; i++) {
            let files = user.files[fileKeys[i]];

            if(!files) {
                continue;
            }

            for(let j=0; j<files.length; j++) {
                form.append(fileKeys[i], files[j]);
            }
        }

        if(isEdit) {
            query = Api.put('/sellers', form);
        }
        else {
            query = Api.post('/sellers', form);
        }
        
        query.then(out => {
            this.props.changePage('/sellers');
            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(out => {
            switch(out) {
                case 100:
                    swal({ title: "Произошла ошибка", text: "Размер изображения не должен превышать 1500*1500!", icon: "error", button: "Ок" });
                    break;
                
                default:
                    swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
            }
        });
    }

    updateData = (data) => {
        return new Promise((resolved) => {
            this.setState({ data }, resolved);
        });
    }
    
    render = () => {
        let location = this.props.location;
        return (
            <div>
                <Switch location={location}>
                    <Route path="/sellers/create" component={() => <SellersCreatePage onUserCreated={this.onUserCreated}/>} />
                    { this.props.seller.data.id && <Route path="/sellers/edit" component={() => <SellersCreatePage isEdit={true} onUserCreated={this.onUserCreated}/>} /> }
                    <Route path="/sellers" component={() => <SellersMainPage data={this.state.data} updateData={this.updateData} updateSellers={this.updateSellers} rowHighlight={this.props.rowHighlight} />} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = ({ user, seller, router }) => ({
    user,
    seller,
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
)(Sellers)
