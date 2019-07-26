import React from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { authenticate } from '../../modules/user'
import Api from '../../utils/api'
import swal from 'sweetalert'

class SignupConfirm extends React.Component {
    constructor (props) {
        super(props);

        const location = this.props.location;
        const data = location.pathname.substr(3).split(':');
        
        Api.post('/user/confirm/' + data[0], { value: data[1] })
        .then(out => {
            swal({ text: "Учестная запись активирована! Для входа на сайт используйте данные при регистрации", icon: "success", button: "Ок" });

            this.props.changePage('/');
        })
        .catch(error => {
            this.props.changePage('/');
        });
    }

    render = () => {
        return (null)
    }
}

const mapStateToProps = ({ user, router }) => ({
    user,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    authenticate,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SignupConfirm)
