import React from 'react'
import { Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { authenticate } from '../../modules/user'
import Api from '../../utils/api'
import swal from 'sweetalert'

class Forgot extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                email: ''
            }
        }
    }

    proceed = (event) => {
        event.preventDefault();

        let data = this.state.data;

        Api.get('/user/forgot/' + data.email)
        .then(out => {
            swal({ text: "Инструкция по восстановлению отправлена на Ваш email!", icon: "success", button: "Ок" });
            this.props.changePage('/');
        })
        .catch(out => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);
        
        state.data[name] = value;
        this.setState(state);
    }

    render = () => {
        let data = this.state.data;

        return (
            <div className="form">
                <form onSubmit={this.proceed}>
                    <div className="title">Восстановление пароля</div>

                    <label>
                        <input type="text" value={data.email} onChange={(e) => this.setData('email', e.target.value)} placeholder="Введите email указанный при регистрации:" className="form-control form-control-sm"/>
                    </label>

                    <div className="center">
                        <input type="submit" value="Продолжить" className="btn btn-info"/>
                        <Link to='/' className="signupLink">Вход</Link>
                    </div>
                </form>

                <div className="info-text">Взаимодействуйте с другими агенствами, находите покупателей и продавцов по всему городу, мониторьте рынок и доски объявлений автоматически, совершайте быстрые совместные сделки, оказывайте качественные услуги вашим клиентам.</div>
            </div>
        )
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
)(Forgot)
