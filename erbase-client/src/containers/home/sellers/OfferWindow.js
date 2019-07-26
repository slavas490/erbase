import React from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal, Button } from 'react-bootstrap'
import './style.scss'
import swal from 'sweetalert'
import Api from '../../../utils/api'

class OfferWindow extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
        };

        this.mailHTML = React.createRef();
    }

    componentDidMount () {
        let selected = this.props.data.filter(item => item._isSelected);
        let ids = selected.map(item => item.id);

        Api.get('/sellers/mailing/' + ids)
        .then(out => {
            this.mailHTML.current.innerHTML = out.html;

            return Api.get('/buyers');
        })        
        .then(data => {
            const value = data.value || [];
            let buyers = value.filter(item => item.realtor === this.props.user.id && !item.deleted);

            this.setState({ ids, buyers });
        });
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);
        state[name] = value;
        this.setState(state);
    }

    submit = (e) => {
        e.preventDefault();

        const state = this.state;
        let email = state.email;
        
        if(!email || !email.length) {
            swal({ text: "Необходимо указать email!", icon: "error", button: "Ок" });
        }
        else {
            Api.get('/sellers/mailing/' + state.ids + '/' + email)
            .then(out => {
                swal({ title: "Успешно", icon: "success", button: "Ок" });
                this.props.onHide();
                this.props.unselect();
            })
            .catch(err => {
                swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
            });
        }
    }

    setActiveUser = (e) => {
        let user = this.state.buyers.find(item => item.id === +e.target.value);

        if (user) {
            this.setState({ selectedUser: user.id, email: user.email });
        }
    }

    render = () => {
        const data = this.state;

        return (
            <Modal size="lg" className="seller-card" show={true} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Подборка объектов</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="as-row" onSubmit={this.submit}>
                        <div className="vr">
                            <div className="input-group">
                                <label>
                                    <div className="title">Клиент</div>
                                    <div className="value">
                                        <select className="custom-select custom-select-sm" value={data.selectedUser} onChange={this.setActiveUser}>
                                            <option value="">-</option>
                                            {
                                                data.buyers && data.buyers.map(item => <option key={item.id} data-email={item.email} value={item.id}>{item.name}</option>)
                                            }
                                        </select>
                                    </div>
                                </label>

                                <label>
                                    <div className="title required">Email клиента</div>
                                    <div className="value">
                                        <input className="form-control form-control-sm" type="text" value={data.email} onChange={(e) => { this.setData('email', e.target.value); }}/>
                                    </div>
                                </label>

                                <label>
                                    <div className="title">&nbsp;</div>
                                    <div className="value">
                                        <button className="btn btn-sm btn-info">Отправить</button>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label>
                                    <div className="title">Сообщение:</div>
                                    <div className="value">
                                        <div id="mailPreview" ref={this.mailHTML} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
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
)(OfferWindow)
