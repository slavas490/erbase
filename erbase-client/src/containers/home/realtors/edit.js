import React from 'react'
import { Link } from 'react-router-relative-link';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import swal from 'sweetalert'

class RealtorEditPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                id: 0,
                agency: '',
                name: '',
                phone: '',
                email: '',
                specialize: 1,
                private: 0,
                phoneChief: '',
                isActive: 0,
                designColor: '',
                customLogo: 0,
                agencyTitle: ''
            },
            files: {
                designLogo: null
            }
        };
    }

    updateData = () => {
        let activeRealtor = this.props.realtor.data;
        
        this.setState({
            data: {
                ...this.state.data,
                ...activeRealtor,
                private: Boolean(activeRealtor.private),
                isActive: Boolean(activeRealtor.isActive)
            }
        });
    }

    componentDidMount () {
        this.updateData();
    }

    save = (e) => {
        e.preventDefault();
        let data = Object.assign({}, this.state.data);
        let files = Object.assign({}, this.state.files);

        data.isActive = +data.isActive;
        data.private = +data.private;

        if(this.props.onEdit) {
            this.props.onEdit({ data, files });
        }
    }

    removeLogo = () => {
        let user = Object.assign({}, this.state.data);
        user.customLogo = 0;

        Api.delete('/realtors/logo/' + user.id)
        .then(out => {
            this.setState({
                data: user
            });

            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(() => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);

        state.data[name] = value;
        this.setState(state);
    }

    setFile = (name, value) => {
        let state = Object.assign({}, this.state);
        
        state.files[name] = (value && value.length === 0 ? null : value);
        this.setState(state);
    }
    
    render = () => {
        const data = this.state.data;
        
        return (
            <form className="as-row" onSubmit={this.save}>
                <div className="vr">
                    <label>
                        <div className="title required">ФИО</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.name} onChange={(e) => this.setData('name', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title required">Телефон</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.phone} onChange={(e) => this.setData('phone', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Email</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.email} onChange={(e) => this.setData('email', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Цвет дизайна</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.designColor} onChange={(e) => this.setData('designColor', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Заголовок сайта</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.agencyTitle} onChange={(e) => this.setData('agencyTitle', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Логотип компании</div>
                        <div className="value">
                            <input type="file" onChange={(e) => this.setFile('designLogo', e.target.files)}/>
                        </div>
                    </label>

                    { data.customLogo === 1 && 
                        <div>
                            <span className="link" onClick={this.removeLogo}>Удалить логотип</span>
                        </div>
                    }
                </div>

                <div className="vr">
                    <div className="input-group">
                        <label>
                            <div className="title">Агенство (указано при регистрации)</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.agency} onChange={(e) => this.setData('agency', e.target.value)}/>
                            </div>
                        </label>

                        <label>
                            <div className="title">Специализация</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" value={data.specialize} onChange={(e) => this.setData('specialize', e.target.value)}>
                                    {   this.props.general.specialize.map(item => 
                                            <option value={item.id} key={item.id}>{item.name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </label>
                    </div>
                
                    <div className="input-group">
                        <label>
                            <div className="title">Агенство</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" value={data.agencyId} onChange={(e) => this.setData('agencyId', e.target.value)}>
                                    <option value="0">-</option>
                                    {   this.props.general.agency.map(item => 
                                            <option value={item.id} key={item.id}>{item.name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Частный риелтор</div>
                            <div className="value">
                                <input type="checkbox" checked={data.private} onChange={(e) => this.setData('private', e.target.checked)}/>
                            </div>
                        </label>

                        {
                            !!data.private &&
                            <label>
                                <div className="title">Телефон руководителя</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="text" value={data.phoneChief} onChange={(e) => this.setData('phoneChief', e.target.value)}/>
                                </div>
                            </label>
                        }
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Активен</div>
                            <div className="value">
                                <input type="checkbox" checked={data.isActive} onChange={(e) => this.setData('isActive', e.target.checked)}/>
                            </div>
                        </label>
                    </div>

                    <div className="input-group btn-group">
                        <button className="btn btn-sm btn-success">Сохранить</button>
                        <Link to=".." className="btn btn-sm btn-danger">Отменить</Link>
                    </div>
                </div>
            </form>
        )
    }
}

const mapStateToProps = ({ user, realtor, general, router }) => ({
    user,
    realtor,
    general,
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
)(RealtorEditPage)
