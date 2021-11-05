import React, { Component } from "react";

import classnames from "classnames";

import Loading from "./Loading";

import Panel from "./Panel";

import axios from "axios";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";

 import { setInterview } from "helpers/reducers";

// const data = [
//   {
//     id: 1,
//     label: "Total Interviews",
//     value: 6
//   },
//   {
//     id: 2,
//     label: "Least Popular Time Slot",
//     value: "1pm"
//   },
//   {
//     id: 3,
//     label: "Most Popular Day",
//     value: "Wednesday"
//   },
//   {
//     id: 4,
//     label: "Interviews Per Day",
//     value: "2.3"
//   }
// ];
const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {
  //state = { loading: false, focused: null};
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
   };

  /* Instance Method */
  // selectPanel(id) {
  //   this.setState({
  //    focused: id
  //   });
  // }
  /* Class Property with Arrow Function */
  // selectPanel = id => {
  //   this.setState({
  //    focused: id
  //   });
  // };
  // latest
  selectPanel(id) {
    this.setState(previousState => ({
      focused: previousState.focused !== null ? null : id
    }));
  }

  componentDidMount() {
    // const focused = JSON.parse(localStorage.getItem("focused"));

    // if (focused) {
    //   this.setState({ focused });
    // }
    //
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
    
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  render() {
    //const dashboardClasses = classnames("dashboard");
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });

    if (this.state.loading) {
      return <Loading />;
    }
    console.log('++++++',this.state)

    const panels = data
    .filter(
      panel => this.state.focused === null || this.state.focused === panel.id
    )
    .map(panel => (
    // <Panel
    //  key={panel.id}
    //  id={panel.id}
    //  label={panel.label}
    //  value={panel.value}
    // />
      // <Panel
      //   key={panel.id}
      //   label={panel.label}
      //   value={panel.value}
      //   onSelect={event => this.selectPanel(panel.id)}
      // />
      <Panel
        key={panel.id}
        label={panel.label}
        value={panel.getValue(this.state)}
        onSelect={() => this.selectPanel(panel.id)}
      />
   ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;