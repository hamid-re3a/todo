import React from "react";
import { Button, Container, Segment, Grid, Header, Tab } from "semantic-ui-react";
import { withRouter } from 'next/router'
import {
  Table,
  Message,
  Label,
  Icon,
  Dimmer,
  Loader,
  Form,
  Transition,
  Image,
  Confirm,
  Input,
  Select,
  Divider,
  Popup,
  Statistic
} from "semantic-ui-react";
import Link from 'next/link';
// import 'semantic-ui-css/semantic.min.css'
import { connect } from "react-redux";
import lang from "../resources/lang/app.json";

import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';
import { Component } from 'react'
import { exit } from "process";

class Home extends Component {
  state = {
    task: '', duration: 60,
    deleteConfirmOpen: false,
    toBeDeletedTask: null,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
    day: false,
    todos: this.props.todos
  }


  deleteConfirmOpen = () => { this.setState({ deleteConfirmOpen: true }); }
  deleteConfirmClose = () => this.setState({ deleteConfirmOpen: false })

  componentDidUpdate() {

    this.props.todos.map(function (item, i) {

      let index = this.props.todos.findIndex(el => el.task === item.task)

      this.props.todos[index].tick = (ref) => {
        let index = this.props.todos.findIndex(el => el.task === item.task)
        this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] = ref.total


        let d = Math.abs(ref.total);
        let sign = (parseInt(ref.total) > 0) ? "" : "-";
        document.title = item.task + ", " + sign + (new Date(d)).toUTCString().substr(17, 8);

        this.props.dispatch({
          type: "UPDATE",
          key: item.task,
          payload: {
            total: this.props.todos[index].total
          }
        })

      }
    }.bind(this))

  }
  handleChange = (e, input) => {
    if (input.type === "checkbox") {
      this.setState({ [input.name]: input.checked })
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  handleSubmit = () => {

    const { task, duration } = this.state

    if (task.length === 0 || parseInt(duration) === 0) {
      alert(lang[this.props.router.locale]["Fill all fileds"])
      return
    }

    let days = {
      mon: this.state.mon,
      tue: this.state.tue,
      wed: this.state.wed,
      thu: this.state.thu,
      fri: this.state.fri,
      sat: this.state.sat,
      sun: this.state.sun,
    }

    if (!(
      this.state.mon ||
      this.state.tue ||
      this.state.wed ||
      this.state.thu ||
      this.state.fri ||
      this.state.sat ||
      this.state.sun
    )) {
      if (!this.state.day)
        days[new Date().toLocaleString().substr(0, 10)] = true
    }



    if (this.state.day) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      days[tomorrow.toLocaleString().substr(0, 10)] = true
    }


    this.props.dispatch({
      type: "ADD",
      key: task,
      payload: {
        task,
        duration: duration * 60 * 1000,
        isStarted: false,
        total: {},
        clockApi: null,
        days
      }


    })



    this.setState({
      ...this.state,
      task: '', duration: 60,

      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
      day: false,
      todos: [
        ...this.state.todos,
        {
          task,
          duration: duration * 60 * 1000,
          isStarted: false,

          total: {},
          clockApi: null,
          days
        }
      ]
    });
    alert(lang[this.props.router.locale]["OK"])

  }

  deleteRecord = (item) => {

    this.props.dispatch({
      type: "DELETE",
      key: item.task,
    })

  }


  stopAll = () => {

    this.props.todos.map(function (item, index) {
      if (item.isStarted) {
        this.props.dispatch({
          type: "UPDATE",
          key: item.task,
          payload: {
            isStarted: false
          }
        })

        if (this.props.todos[index].clockApi !== null)
          this.props.todos[index].clockApi.pause()
      }


    }.bind(this))
    alert(lang[this.props.router.locale]["OK"])


  }


  cutTotalTime = (item, time, operation) => {


    let index = this.props.todos.findIndex(el => el.task === item.task)


    if (this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] === undefined)
      this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] = this.props.todos[index].duration;
    if (operation === 'minus')
      this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] = this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] - time * 1000 * 60
    else
      this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] = this.props.todos[index].total[new Date().toLocaleString().substr(0, 10)] + time * 1000 * 60
    this.props.dispatch({
      type: "UPDATE",
      key: item.task,
      payload: {
        total: this.props.todos[index].total
      }
    })
  }
  toggleCountDownStatus = (item) => {

    let concurrent = this.props.todos.findIndex(function (inner_item, i) {
      if (inner_item.task == item.task)
        return false
      return inner_item.isStarted
    })
    if (concurrent !== -1) {
      alert(lang[this.props.router.locale]["Concurrent jobs"])

      return;
    }


    let index = this.props.todos.findIndex(el => el.task === item.task)
    if (this.props.todos[index].isStarted) {
      this.props.dispatch({
        type: "UPDATE",
        key: item.task,
        payload: {
          isStarted: false
        }
      })
      // this.state.todos[index].isStarted = false
      this.props.todos[index].clockApi.pause()
    } else {
      this.props.dispatch({
        type: "UPDATE",
        key: item.task,
        payload: {
          isStarted: true
        }

      })
      // this.state.todos[index].isStarted = true
      this.props.todos[index].clockApi.start()
    }

    this.setState({
      ...this.state,
      todos: this.props.todos
    })
  }

  render() {
    console.log(this.props.todos)
    return (

      <React.Fragment>

        <Container style={{ marginTop: 30 }}>


          <Link href={this.props.router.asPath} locale={(this.props.router.locale == "fa-IR") ? "en-US" : "fa-IR"}>
            {(this.props.router.locale == "fa-IR") ? "English" : "فارسی"}
          </Link>
        </Container>
        <div dir={(this.props.router.locale == "fa-IR") ? "rtl" : ""}>

          <Container style={{ marginTop: 30 }}>
            <Divider horizontal>
              <Header as="h2">{lang[this.props.router.locale]["Today's Tasks"]}</Header></Divider>
            {this.props.todos.filter(todaysTask).length != 0 ? (
              <Table compact basic='very'>

                <Table.Body>
                  {/* We get an Object for todos so we have to map and pull out each "element" */}

                  <Table.Row>
                    <Table.HeaderCell width={4}>{lang[this.props.router.locale]["Task Name"]} </Table.HeaderCell>
                    <Table.HeaderCell width={2}>{lang[this.props.router.locale]["Duration"]} </Table.HeaderCell>
                    <Table.HeaderCell width={2}>{lang[this.props.router.locale]["Task Status"]} </Table.HeaderCell>
                    <Table.HeaderCell width={2}>{lang[this.props.router.locale]["Total Done"]} </Table.HeaderCell>
                    <Table.HeaderCell width={2}> </Table.HeaderCell>
                    <Table.HeaderCell width={4}>
                      <Button content={lang[this.props.router.locale]["Stop All"]} style={{ width: "50%" }}
                        color='teal' basic size='mini'
                        onClick={() => this.stopAll()} />
                    </Table.HeaderCell>
                  </Table.Row>
                  {this.props.todos.filter(todaysTask).map(function (item, i) {

                    let startPoint = (item.total[new Date().toLocaleString().substr(0, 10)] != undefined) ? item.total[new Date().toLocaleString().substr(0, 10)] : parseInt(item.duration);
                    return (
                      <Table.Row key={i}>

                        <Table.Cell width={4}>
                          {/* {item.task} */}

                          <Form.Input
                            name='task'
                            transparent
                            value={item.task}
                            onChange={(el) => {
                              this.props.dispatch({
                                type: "UPDATE",
                                key: item.task,
                                payload: {
                                  task: el.target.value
                                }

                              })
                            }}
                          />
                        </Table.Cell>
                        <Table.Cell width={2}>
                          {(new Date(item.duration)).toUTCString().substr(17, 8)}
                        </Table.Cell>
                        <Table.Cell width={2}>
                          {taskStutus(item, this.props.router.locale)}
                        </Table.Cell>
                        <Table.Cell width={2}>

                          <Countdown
                            date={Date.now() + startPoint}
                            ref={item.ref}
                            autoStart={false}
                            controlled={false}
                            onTick={item.tick}
                            overtime={true}
                            renderer={function ({ total, hours, minutes, seconds, api }) {

                              if (total === 0) {
                                (new Audio('/assets/sounds/clown-horn.wav')).play();
                              }
                              item.clockApi = api
                              let sign = (parseInt(total) > 0) ? "" : "-";

                              if ((this.props.router.locale == "fa-IR"))
                                return zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds) + sign
                              return sign + zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds)
                            }.bind(this)}
                          />

                        </Table.Cell>

                        <Table.Cell width={2}>
                          <Button icon={'minus'} content={'5'} color='teal' basic size='mini' onClick={() => this.cutTotalTime(item, 5, 'minus')} />
                          <Button icon={'plus'} content={'5'} color='teal' basic size='mini' onClick={() => this.cutTotalTime(item, 5, 'plus')} />
                        </Table.Cell>
                        <Table.Cell width={4}>
                          <Button icon='delete' content={lang[this.props.router.locale]["Delete"]} color="black" basic size='mini' onClick={() => { this.deleteConfirmOpen(); this.setState({ toBeDeletedTask: item }) }} />
                          <Confirm
                            open={this.state.deleteConfirmOpen}
                            onCancel={this.deleteConfirmClose}
                            content={lang[this.props.router.locale]["Confirm content"]}
                            cancelButton={lang[this.props.router.locale]["Cancel Button"]}
                            confirmButton={lang[this.props.router.locale]["Confirm Button"]}
                            size='mini'
                            onConfirm={() => { this.deleteConfirmClose(); this.deleteRecord(this.state.toBeDeletedTask) }}
                          />

                          <Button icon={item.isStarted ? 'pause' : 'play'} content={item.isStarted ? lang[this.props.router.locale]["Pause"] : lang[this.props.router.locale]["Start"]} color='teal' basic size='mini' onClick={() => this.toggleCountDownStatus(item)} />


                        </Table.Cell>
                      </Table.Row>
                    )
                  }.bind(this))
                  }
                  {/* End of Object.keys */}
                </Table.Body>
              </Table>
            ) : (
              <Message positive>
                <Message.Header>{lang[this.props.router.locale]["No Job"]}</Message.Header>
                <p>
                  {lang[this.props.router.locale]["No Job description"]}
                </p>
              </Message>
            )}
            <Form>

              <Grid>
                <Grid.Row>
                  <Grid.Column textAlign="center">
                    <Divider horizontal>{lang[this.props.router.locale]["Statistics"]}</Divider>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" />
                        <span style={{ padding: 8 }}>
                          {this.props.todos.filter(todaysTask).length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label>{lang[this.props.router.locale]["All Tasks"]}</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" color="orange" />
                        <span style={{ padding: 8, color: '#f2711c' }}>
                          {this.props.todos.filter(todaysTask).filter((el) => { return el.total[new Date().toLocaleString().substr(0, 10)] === undefined })
                            .length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label style={{ color: '#f2711c' }}>{lang[this.props.router.locale]["Pending"]}</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" color="teal" />
                        <span style={{ padding: 8, color: '#009c95' }}>
                          {this.props.todos.filter(todaysTask).filter((el) => { return parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0) })
                            .length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label style={{ color: '#009c95' }}>{lang[this.props.router.locale]["In Progress"]}</Statistic.Label>
                    </Statistic>

                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" style={{ color: 'gray' }} />
                        <span style={{ padding: 8, color: "gray" }}>
                          {this.props.todos.filter(todaysTask).filter((el) => { return parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0 })
                            .length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label style={{ color: "gray" }}>
                        {lang[this.props.router.locale]["Compeleted"]}
                      </Statistic.Label>
                    </Statistic>
                  </Grid.Column>
                </Grid.Row>

              </Grid>
            </Form>
            {/* End add a form at the end of the table */}
          </Container>

          <Container>
            <Segment>
              <Header>{lang[this.props.router.locale]["New Task"]}</Header>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group >
                  <Form.Input
                    width={2}
                    style={{ marginBottom: 4 }}
                    type='number'
                    placeholder={lang[this.props.router.locale]["Duration"]}
                    name='duration'
                    value={this.state.duration}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    width={14}
                    style={{ marginBottom: 4 }}
                    placeholder={lang[this.props.router.locale]["Task Name"]}
                    name='task'
                    value={this.state.task}
                    onChange={this.handleChange}
                  />

                </Form.Group>
                <Form.Group inline>
                  <Button content={lang[this.props.router.locale]["Just Today"]} color="teal" basic size='mini' onClick={(e) => {
                    e.preventDefault()
                    this.setState({
                      ...this.state,
                      mon: false,
                      tue: false,
                      wed: false,
                      thu: false,
                      fri: false,
                      sat: false,
                      sun: false
                    })
                  }} />
                  <Button content={lang[this.props.router.locale]["Everyday"]} color="teal" basic size='mini' onClick={(e) => {
                    e.preventDefault()
                    this.setState({
                      ...this.state,
                      mon: true,
                      tue: true,
                      wed: true,
                      thu: true,
                      fri: true,
                      sat: true,
                      sun: true
                    })
                  }} />
                  <Button content={lang[this.props.router.locale]["Odd days"]} color="teal" basic size='mini' onClick={(e) => {
                    e.preventDefault()
                    this.setState({
                      ...this.state,
                      mon: false,
                      tue: true,
                      wed: false,
                      thu: true,
                      fri: false,
                      sat: false,
                      sun: true
                    })
                  }} />

                  <Button content={lang[this.props.router.locale]["Even days"]} color="teal" basic size='mini' onClick={(e) => {
                    e.preventDefault()
                    this.setState({
                      ...this.state,
                      mon: true,
                      tue: false,
                      wed: true,
                      thu: false,
                      fri: false,
                      sat: true,
                      sun: false
                    })

                  }} />
                  <Form.Checkbox style={{ marginLeft: 4, marginRight: 4 }} checked={this.state.day} onChange={this.handleChange} label={lang[this.props.router.locale]['Tomorrow']} name='day' />
                </Form.Group>
                <Form.Group inline>
                  <label>{lang[this.props.router.locale]['Days']}</label>
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.mon} onChange={this.handleChange} label={lang[this.props.router.locale]['Monday']} name='mon' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.tue} onChange={this.handleChange} label={lang[this.props.router.locale]['Tuesday']} name='tue' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.wed} onChange={this.handleChange} label={lang[this.props.router.locale]['Wednesday']} name='wed' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.thu} onChange={this.handleChange} label={lang[this.props.router.locale]['Thursday']} name='thu' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.fri} onChange={this.handleChange} label={lang[this.props.router.locale]['Friday']} name='fri' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sat} onChange={this.handleChange} label={lang[this.props.router.locale]['Saturday']} name='sat' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sun} onChange={this.handleChange} label={lang[this.props.router.locale]['Sunday']} name='sun' />
                </Form.Group>
                <Form.Group>
                  <Form.Button width={2} content={lang[this.props.router.locale]['Submit']} />
                </Form.Group>
              </Form>
            </Segment>

          </Container>

        </div>
      </React.Fragment>
    )
  }
}
const taskStutus = (el, locale) => {
  if (parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0)
    return <Button basic content={lang[locale]["Compeleted"]} size='mini' />
  else if (parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0))
    return <Button basic color='teal' content={lang[locale]["In Progress"]} size='mini' />
  else if (el.total[new Date().toLocaleString().substr(0, 10)] === undefined)
    return <Button basic color='orange' content={lang[locale]["Pending"]} size='mini' />


  return <Button basic color='orange' content={lang[locale]["Pending"]} size='mini' />
}
const todaysTask = (el) => {
  let day = ''
  switch (parseInt(new Date().getDay().toLocaleString())) {
    case 0:
      day = 'sun'
      break;

    case 1:
      day = 'mon'
      break;

    case 2:
      day = 'tue'
      break;

    case 3:
      day = 'wed'
      break;

    case 4:
      day = 'thu'
      break;

    case 5:
      day = 'fri'
      break;

    case 6:
      day = 'sat'
      break;

  }
  if (el === undefined || el === null)
    return false

  return el.days[day] === true || el.days[new Date().toLocaleString().substr(0, 10)] === true
}

const mapStateToProps = state => ({
  todos: state.app.todos,
});

const ConnectedApp = withRouter(connect(mapStateToProps)(Home));
export default ConnectedApp


