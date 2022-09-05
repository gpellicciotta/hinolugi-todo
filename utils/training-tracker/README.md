# Training Tracker

A utility for tracking training exercises performed, and relating them to a fixed training schedule.

## Roadmap

### v1.0.0 - First Viable Product

Visualize a pre-created schedule of exercises + allow adding (and later viewing) training data to exercises.

## Design

### Terminology

- Training schedule: A named collection of exercises
- Workout diary: A named collection of workout session data
- Workout session: The execution of a single training exercise

### Training Schedule

There are training schedules, which basically consists of:
  - a name 
  - a short purpose description
  - a ordered list of exercises
  - each exercise has:
    - a name (e.g. run-1-week-1-day-1, rest)
    - a description (e.g. Run with easy pace, Rest)
    - one or more goals (amount + unit (+ reps), e.g. km, reps, mins, ...)

    E.g. { 'name': 'run-1:week-1:day-1', 'goals': { "distance": [ 3.2, 'km' ] } }
         { 'name': 'rest-day' }
         { 'name': 'bench', 'goals': { "weight": [ 70, 'kg' ], "repetitions": 13 } }

Example:
```
  // Training schedules is a named set of training-schedule objects:
  training-schedules: {
    // A training schedule has a unique name, description and ordered list of exercises:
    "half-marathon": {
      "name": "half-marathon",
      "description": "A 12 week training for running half a marathon",
      "type": "sequence",  // A sequences of exercices to be executed on successive days
      "exercises": [
        // Each exercise also has a unique name, description and set of goals:
        { 
          "name": "training-1", 
          "description": "Week 1 - Day 1 - Easy run", 
          "goals": { "distance": [ 3.2, "km" ] } 
        },
        { 
          "name": "training-5", 
          "description": "Week 2 - Day 3 - Hill run", 
          "goals": { "distance": [ 4.8, "km" ] }
        },
        // ...
        { 
          "name": "training-36", 
          "description": "Week 12 - Match day!", 
          "goals": { "distance": [ 21.1, "km" ] }
        }
      }
    ]
  }

  // Goals can be:
  goals: {
    "distance": [ 3.2, "km" ],
    "time": [ 60, "min" ],
    "repetitions": 33,
    "weight": [ 70, "kg" ]
  }

```

### Workout Diaries & Workout Sessions

Named collections of the data of training exercises performed.

An actual __workout session__ consists of:
  - a reference to a training schedule + exercise
  - execution date
  - achievement (amount + unit (+ reps))
  - notes

Why have named workout diaries? 
To make it easier to visualize and collect data on time-boxed _training projects_, 
e.g. in Spring 2022 doing a full half-marathon training - named 'Spring 2022 Half Marathon', 
     while also still doing continuous fitness exercises - named 'Overall Fitness'.

Example:
```
  // Workout-diaries is a named set of individual diary objects:
  workout-diaries: {
    // Each diary has a unique name, creation-time, status and session-data:
    "Spring 2022 Half-Marathon Training": {
      name: "Spring 2022 Half-Marathon Training",
      creation-time: "2022-03-20T20:15:01",
      status: "open", // possible values: "open", "closed"
      // The session data objects are an ordered list (in creation order) of objects that
      //   have a date, refer to a specific exercise in a specific training schedule,
      //   an a list of achievements that can be related to the exercise's goals:
      //   There is also room for some free-form notes.
      sessions: [
        { 
          "date": "2022-03-23", 
          "ref": { 
            "schedule": "half-marathon", 
            "exercise": "run-1:wk#1:d#1" 
          },
          "achievements": { 
            "distance": [ 3.3, "km" ], 
            "time": "0:18:12" 
          }, 
          "notes": "very difficult start"
        },
        // ... more session data
      ]
    }
  }
  
  // More achievement properties:
  achievements: {
    "distance": [ 3.2, "km" ],
    "time": [ 60, "min" ],
    "repetitions": 33,
    "weight": [ 70, "kg" ]
  }  
```

Defaults for goals/achievements:
  - distance: m as default
  - time: s as default, [ hours, minutes, seconds ], "h:mm:ss"
  - repetitions: number
  - weight: kg, [ num, "unit" ]

