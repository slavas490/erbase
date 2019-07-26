import React from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { setActiveDeal } from '../../../modules/deal'
import { Modal, Button } from 'react-bootstrap'

class DealsMainPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            type: 0,
            text: ''
        };
    }

    proceed = () => {
        const { type, text } = this.state;

        let data = {
            type,
            text
        };
        
        this.props.onRemove(data);
    }

    render = () => {
        const state = this.state;

        return (
            <Modal onHide={this.props.onClose} show={true} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Удаление сделки</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="input-group">
                        <label>
                            <div className="value">
                                <input type="radio" checked={state.type === 0} onChange={() => this.setState({ type: 0 })} /> <span className="title">Успешно завершена</span>
                            </div>
                        </label>
                    </div>
                    <div className="input-group">
                        <label>
                            <div className="value">
                                <input type="radio" checked={state.type === 1} onChange={() => this.setState({ type: 1 })} /> <span className="title">Не состоялась</span>
                            </div>
                        </label>
                    </div>
                    { state.type === 1 &&
                        <div className="input-group" style={{marginTop: 10}}>
                            <label style={{width: '100%'}}>
                                <div className="title">Причина несостоявшейся сделки</div>
                                <div className="value">
                                    <textarea value={state.text} onChange={e => this.setState({ text: e.target.value })} class="form-control form-control-sm"></textarea>
                                </div>
                            </label>
                        </div>
                    }
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={this.proceed}>Удалить</Button>
                </Modal.Footer>
            </Modal>
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
    setActiveDeal,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DealsMainPage)
