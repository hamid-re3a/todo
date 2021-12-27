import React from "react";
import { Button, Container, Segment, Grid, Header } from "semantic-ui-react";
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
// import 'semantic-ui-css/semantic.min.css'
import { connect } from "react-redux";

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
      alert('تمام فیلدها را پر کنید')
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
      days[new Date().toLocaleString().substr(0, 10)] = true
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


  }

  deleteRecord = (item) => {

    this.props.dispatch({
      type: "DELETE",
      key: item.task,
    })

  }


  toggleCountDownStatus = (item) => {
    let concurrent = this.props.todos.findIndex(function (inner_item, i) {
      if (inner_item.task == item.task)
        return false
      return inner_item.isStarted
    })
    if (concurrent !== -1) {
      alert('شما نمیتوانید دو کار را همزمان انجام دهید')

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

    return (
      <React.Fragment>
        <div dir="rtl">

          <Container style={{ marginTop: 60 }}>
            <Divider horizontal>
              <Header as="h2">لیست کارهای امروز</Header></Divider>
            {this.props.todos.filter(todaysTask).length != 0 ? (
              <Table compact basic='very'>

                <Table.Body>
                  {/* We get an Object for todos so we have to map and pull out each "element" */}

                  {this.props.todos.filter(todaysTask).map(function (item, i) {

                    let startPoint = (item.total[new Date().toLocaleString().substr(0, 10)] != undefined) ? item.total[new Date().toLocaleString().substr(0, 10)] : parseInt(item.duration);
                    return (
                      <Table.Row key={i}>

                        <Table.Cell width={6}>
                          {item.task}
                        </Table.Cell>
                        <Table.Cell width={2}>
                          {(new Date(item.duration)).toUTCString().substr(17, 8)}
                        </Table.Cell>
                        <Table.Cell width={2}>
                          {taskStutus(item)}
                        </Table.Cell>
                        <Table.Cell width={2} onClick={() => this.toggleCountDownStatus(item)}>

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

                              return sign + zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds)
                            }.bind(this)}
                          />
                        </Table.Cell>
                        <Table.Cell width={4}>
                          <Button content='حذف' color="black" basic size='mini' onClick={() => { this.deleteConfirmOpen(); this.setState({ toBeDeletedTask: item }) }} />
                          <Confirm
                            open={this.state.deleteConfirmOpen}
                            onCancel={this.deleteConfirmClose}
                            content="آیا مطمئنید؟"
                            size='small'
                            onConfirm={() => { this.deleteConfirmClose(); this.deleteRecord(this.state.toBeDeletedTask) }}
                          />
{/* icon={item.isStarted ? 'pause' : 'play'}  */}
                          <Button content={item.isStarted ? 'توقف' : 'انجام'} color='teal' basic size='mini' onClick={() => this.toggleCountDownStatus(item)} />
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
                <Message.Header>کاری نیست</Message.Header>
                <p>
                 به نظر میرسه همه کارها <b>انجام شده!</b>
                </p>
              </Message>
            )}
            <Form>

              <Grid>
                <Grid.Row>
                  <Grid.Column textAlign="center">
                    <Divider horizontal>آمار</Divider>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" />
                        <span style={{ padding: 8 }}>
                          {this.props.todos.filter(todaysTask).length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label>تمام کارها</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" color="orange" />
                        <span style={{ padding: 8, color: '#f2711c' }}>
                          {this.props.todos.filter(todaysTask).filter((el) => { return el.total[new Date().toLocaleString().substr(0, 10)] === undefined })
                            .length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label style={{ color: '#f2711c' }}>انجام نشده</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        <Icon name="tasks" color="teal" />
                        <span style={{ padding: 8, color: '#009c95' }}>
                          {this.props.todos.filter(todaysTask).filter((el) => { return parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0) })
                            .length}
                        </span>
                      </Statistic.Value>
                      <Statistic.Label style={{ color: '#009c95' }}>در حال انجام</Statistic.Label>
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
                        تکمیل شده
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
              <Header>کار جدید</Header>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group >
                  <Form.Input
                    width={2}
                    style={{ marginBottom: 4 }}
                    type='number'
                    placeholder='مدت انجام'
                    name=' مدت انجام'
                    value={this.state.duration}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    width={14}
                    style={{ marginBottom: 4 }}
                    placeholder='اسم کار'
                    name='اسم کار'
                    value={this.state.task}
                    onChange={this.handleChange}
                  />

                </Form.Group>
                <Form.Group inline>
                  <Button content='فقط امروز' color="teal" basic size='mini' onClick={(e) => {
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
                  <Button content='هر روز' color="teal" basic size='mini' onClick={(e) => {
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
                  <Button content='روزهای فرد' color="teal" basic size='mini' onClick={(e) => {
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

                  <Button content='روزهای زوج' color="teal" basic size='mini' onClick={(e) => {
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
                </Form.Group>
                <Form.Group inline>
                  <label>روزها</label>
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.mon} onChange={this.handleChange} label='دوشنبه' name='mon' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.tue} onChange={this.handleChange} label='سه شنبه' name='tue' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.wed} onChange={this.handleChange} label='چهارشنبه' name='wed' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.thu} onChange={this.handleChange} label='پنجشنبه' name='thu' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.fri} onChange={this.handleChange} label='جمعه' name='fri' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sat} onChange={this.handleChange} label='شنبه' name='sat' />
                  <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sun} onChange={this.handleChange} label='یکشنبه' name='sun' />
                </Form.Group>
                <Form.Group>
                  <Form.Button width={2} content='ثبت' />
                </Form.Group>
              </Form>
            </Segment>

          </Container>

        </div>
      </React.Fragment>
    )
  }
}
const taskStutus = (el) => {
  if (parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0)
    return <Button basic content='تکمیل شده' size='mini' />
  else if (parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toLocaleString().substr(0, 10)]) <= 0))
    return <Button basic color='teal' content='در حال انجام' size='mini' />
  else if (el.total[new Date().toLocaleString().substr(0, 10)] === undefined)
    return <Button basic color='orange' content='انجام نشده' size='mini' />


  return <Button basic content='Undefined' />
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

const ConnectedApp = connect(mapStateToProps)(Home);
export default ConnectedApp
