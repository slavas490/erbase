import React from 'react'

const ContextMenuItem = (dataName, itemName, isActive, icon = null, children = null) => {
    return { dataName, itemName, isActive };
}

class ContextMenu extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            data: [],
            mousePosition: {},
            isActive: !!props.isActive
        };
    }

    componentDidMount () {
        this.setData(this.props.data);

        window.addEventListener('click', () => {
            this.setState({ isActive: false });
        });
    }

    componentWillReceiveProps (props) {
        if(props.isActive) {
            this.setData(props.data);
        }
        else {
            this.setState({ isActive: false });
        }
    }

    setData = (data) => {
        if(data && data.data instanceof Array && data.mousePosition) {
            this.setState({ 
                data: data.data,
                mousePosition: data.mousePosition,
                isActive: true
            });
        }
    }

    onClick = (data) => {
        if(this.props.onSelect) {
            this.props.onSelect(data.dataName);
            this.setState({ isActive: false });
        }
    }
    
    render = () => {
        if(this.state.isActive) {
            let position = this.state.mousePosition,
                data = this.state.data;
                
            return (
                <ul className="contextMenu" style={{top: position.y, left: position.x}}>
                    {
                        data.map(item => 
                            <li key={item.dataName} className={item.isActive ? 'active' : ''} onClick={() => this.onClick(item)}>{item.itemName}</li>    
                        )
                    }
                </ul>
            )
        }
        else {
            return null;
        }
    }
}

export {
    ContextMenu,
    ContextMenuItem
}