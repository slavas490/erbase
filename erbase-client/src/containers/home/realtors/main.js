import React from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import { setActiveRealtor } from '../../../modules/realtor'
import { Table, Field, SortableField, FieldType } from '../table'
import swal from 'sweetalert'
import moment from 'moment'

class RealtorsMainPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            notes: [],
            filter: {
                id: '',
                agency: '',
                name: '',
                phone: '',
                email: '',
                specialize: 1
            }
        };

        this.tableStruct = [SortableField(FieldType.INTEGER, 'id', '№'),
                            SortableField(FieldType.STRING, 'creationDate', 'Дата регистрации'),
                            SortableField(FieldType.NONE, 'nameAgencyName', <>ФИО<br/>Агенство</>),
                            SortableField(FieldType.NONE, 'contactInfo', 'Контакты'),,
                            SortableField(FieldType.STRING, 'specialization', 'Специализация')
                        ];

        if(this.props.user.isAdmin) {
            this.tableStruct.push(Field(FieldType.BUTTON, '!isBlocked', ['Заблокировать', 'Разблокировать']));
            this.tableStruct.push(Field(FieldType.BUTTON, 'edit', 'Редактировать'));
        }
    }

    formatDate = (date, epmtyFill = '') => {
        if(!date) {
            return epmtyFill;
        }

        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }

    tableHandler = (action, value) => {
        let realtor = this.props.data.find(item => item.id === value);
        
        switch (action) {
            case 'edit':
                if(realtor) {
                    this.props.setActiveRealtor(realtor);
                    this.props.changePage('/realtors/edit');
                }

                break;
            
            case 'isBlocked':
                if(realtor) {
                    Api.put('/realtors/' + realtor.id + '/isblocked/', { value: !realtor.isBlocked })
                    .then(out => {
                        this.props.updateRealtors();
                    })
                    .catch(out => {
                        swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                    });
                }

                break;

            default:
                break;
        }
    }

    getSpecialize = (id) => {
        let specialize = this.props.general.specialize.find(item => item.id === id);

        if(specialize) {
            return specialize.name;
        }
        
        return null;
    }

    setFilter = (name, value) => {
        this.setState({
            filter: {...this.state.filter, [name]: value}
        });
    }

    getFilteredData = (data) => {
        const filterData = this.state.filter;
        
        let filter = {
            id: +filterData.id,
            agency: +filterData.agency,
            name: filterData.name,
            phone: filterData.phone,
            email: filterData.email,
            specialize: +filterData.specialize
        };
        
        if(filter.id > 0) {
            data = data.filter(item => item.id === filter.id);
        }

        if(filter.agency > 0) {
            data = data.filter(item => item.agencyId === filter.agency);
        }

        if(filter.name) {
            data = data.filter(item => item.name.toLocaleUpperCase().indexOf(filter.name.toLocaleUpperCase()) !== -1);
        }

        if(filter.phone) {
            data = data.filter(item => item.phone.indexOf(filter.phone) !== -1);
        }

        if(filter.email) {
            data = data.filter(item => item.email.toLocaleUpperCase().indexOf(filter.email.toLocaleUpperCase()) !== -1);
        }

        if(filter.specialize > 0) {
            data = data.filter(item => item.specialize === filter.specialize);
        }

        return data;
    }

    getUserAgency = (user) => {
        let agency = this.props.general.agency.find(item => item.id === user.agencyId);

        if(agency && agency.id) {
            return agency.name;
        }
        else {
            return user.agency;
        }
    }
    
    render = () => {
        const filterData = this.state.filter;
        let data = this.props.data || [];

        data = data.map(item => {
            return ({
                ...item,
                specialization: this.getSpecialize(item.specialize),
                edit: true,
                creationDate: this.formatDate(item.creationDate),
                contactInfo: <>{item.phone}<br/>{item.email}</>,
                nameAgencyName: <>{item.name}<br/>{this.getUserAgency(item)}</>
            })
        });

        // filter
        if(data && data.length > 0) {
            data = this.getFilteredData(data);
            data = data.filter(item => !item.isAdmin);
        }

        return (
            <div className="row">
                <div className="input-group filter">
                    <label>
                        <div className="title">№</div>
                        <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.id} onChange={(e) => this.setFilter('id', (+e.target.value || 0))}/>
                    </label>

                    <label>
                        <div className="title">Агенство</div>
                        <select className="custom-select custom-select-sm" value={filterData.agency} onChange={(e) => this.setFilter('agency', e.target.value)}>
                            <option value={0}>-</option>
                            {
                                this.props.general.agency.map(item =>
                                    <option value={item.id} key={item.id}>{item.name}</option>
                                )
                            }
                        </select>
                    </label>

                    <label>
                        <div className="title">ФИО</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.name} onChange={(e) => this.setFilter('name', e.target.value)}/>
                    </label>

                    <label>
                        <div className="title">Номер телефона</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.phone} onChange={(e) => this.setFilter('phone', e.target.value)}/>
                    </label>

                    <label>
                        <div className="title">Email</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.email} onChange={(e) => this.setFilter('email', e.target.value)}/>
                    </label>

                    <label>
                        <div className="title">Специализация</div>
                        <select className="custom-select custom-select-sm" value={filterData.specialize} onChange={(e) => this.setFilter('specialize', e.target.value)}>
                            {
                                this.props.general.specialize.map(item =>
                                    <option value={item.id} key={item.id}>{item.name}</option>
                                )
                            }
                        </select>
                    </label>
                </div>

                <Table data={data} struct={this.tableStruct} onAction={this.tableHandler} />
            </div>
        )
    }
}

const mapStateToProps = ({ user, general, router }) => ({
    user,
    general,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    setActiveRealtor,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RealtorsMainPage)
