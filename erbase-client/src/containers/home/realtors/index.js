import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import RealtorsMainPage from './main'
import RealtorEditPage from './edit'
import swal from 'sweetalert'

class Realtors extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: []
        };
    }

    componentWillMount = () => {
        this.updateRealtors();
    } 

    updateRealtors = () => {
        Api.get('/realtors')
        .then(data => {
            this.setState({ data: data.value || [] });
        });
    }

    onEdit = (data) => {
        let form = new FormData(),
            dataKeys = Object.keys(data.data),
            fileKeys = Object.keys(data.files);

        for(let i=0; i<dataKeys.length; i++) {
            form.append(dataKeys[i], data.data[dataKeys[i]]);
        }

        for(let i=0; i<fileKeys.length; i++) {
            let files = data.files[fileKeys[i]];

            if(!files) {
                continue;
            }

            for(let j=0; j<files.length; j++) {
                form.append(fileKeys[i], files[j]);
            }
        }

        Api.put('/realtors/' + data.data.id, form)
        .then(out => {
            this.props.changePage('/realtors');
            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(() => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }

    tableHandler = (action, value) => {
        console.log(action, value)
    }
    
    render = () => {
        let location = this.props.location;

        return (
            <div>
                <Switch location={location}>
                    { this.props.realtor.data.id && this.props.user.isAdmin === 1 && <Route path="/realtors/edit" component={() => <RealtorEditPage onEdit={this.onEdit}/>} /> }
                    <Route path="/realtors" component={() => <RealtorsMainPage updateRealtors={this.updateRealtors} data={this.state.data}/>} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = ({ user, realtor }) => ({
    user,
    realtor
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
)(Realtors)
