import React from 'react'

import { EditOrganisationComponent } from '../edit-organisation/edit-organisation';
import { Button, Form, Grid, Segment } from 'semantic-ui-react';

import './not-employed.css';

const axios = require('axios')
const env = require('../../../environment').environment;

export class NotEmployedComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionId: props.sessionId,
            orgs: [],
            displayOrgs: true,
            orgName: null,
            rate: null,
            orgIndex: null
        };
    }

    componentDidMount() {
        this.loadOrgs();
    }

    loadOrgs() {
        let headers = this.getHeaders();
        axios.get(env.BASE_URL + 'organisations', headers).then(
            resp => {
                this.setState({...this.state, orgs: resp.data})
        })
    }

    getHeaders() {
        return {headers: {'Authorization': this.state.sessionId, 'content-type': 'application/json'}};
    }

    displayOrgsHandler = () => {
        this.setState({...this.state, displayOrgs: true});
        let element = document.getElementsByClassName('display-orgs')[0];
        if (!element.classList.contains('active')) {
            element.classList.add('active');
        }        
        document.getElementsByClassName('new-org')[0].classList.remove('active')
    }

    newOrgHandler = () => {
        this.setState({...this.state, displayOrgs: false});
        let element = document.getElementsByClassName('new-org')[0]
        if (!element.classList.contains('active')) {
            element.classList.add('active');
        }
        document.getElementsByClassName('display-orgs')[0].classList.remove('active')
    }

    renderCreateOrg() {
        return (
            <div>
                <Grid textAlign='center'>
                    <Grid.Column className="w--100">
                        <Form size='large'>
                            <Segment>
                                <Form.Input onChange={this.onNameChange} fluid icon='user' iconPosition='left' placeholder="Name e.g Bob's burger" />
                                <Form.Input onChange={this.onSalaryChange} fluid icon='dollar sign' iconPosition='left' placeholder='Hourly Rate' />
                                <Button color='teal' onClick={this.submit} fluid size='large'>Create and Join</Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }

    handleEdit(i) {
        this.setState({...this.state, orgIndex: i});
    }
    
    handleJoin(orgId) {
        let body = {organisationId: orgId}
        axios.post(env.BASE_URL + 'organisations/join', body, this.getHeaders()).then(
            resp => {
                this.props.onOrgChange(resp.data);
            })
    }

    renderEachOrg() {
        return this.state.orgs.map(
            (org, i) => {
                return (<li key={i} className="item">{org.name} <span className="edit-join pl--1" onClick={() => this.handleEdit(i)}>Edit</span> <span className="edit-join pl--0_5" onClick={()=>this.handleJoin(org.id)}>Join</span></li>) 
            }
        )
    }

    renderExistingOrgs() {
        if (this.state.orgs.length === 0) {
            return (
                <p>There is no organisation</p>
            )
        } 
        return (<ul>{this.renderEachOrg()}</ul>)
    }

    renderOrgs() {
        if (this.state.displayOrgs) {
            return this.renderExistingOrgs();
        }
        return this.renderCreateOrg();
    }

    onNameChange = (event) => {
        this.setState({...this.state, orgName: event.target.value})
    }

    onSalaryChange = (event) => {
        this.setState({...this.state, rate: event.target.value})
    }

    submit = () => {
        let body = {name: this.state.orgName, hourlyRate: this.state.rate};
        let headers = this.getHeaders();
        axios.post(env.BASE_URL + 'organisations/create_join', body, headers).then(
        resp => {
            this.props.onOrgChange(resp.data);
        })
    }

    handleUpdatedOrg = () => {
        this.setState({...this.state, orgIndex: null});
        this.loadOrgs();
    }

    renderEditForm() {
        let i = this.state.orgIndex;
        if (i!==null) {
            return (<EditOrganisationComponent org={this.state.orgs[i]} sessionId={this.state.sessionId} onSubmit={this.handleUpdatedOrg} />)
        }
    }

    render() {
        return (
            <div>
                <p>You aren't a member of any organisations. Join an existing one or create a new one.</p>
                <div className="ui two item menu">
                    <Button onClick={this.displayOrgsHandler} className="item active display-orgs">All Organisations</Button>
                    <Button onClick={this.newOrgHandler} className="item new-org">New Organisation</Button>
                </div>
                {this.renderOrgs()}
                {this.renderEditForm()}
            </div>
        )
    }
}