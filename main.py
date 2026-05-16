import json
import random
import time
import inquirer
import sys


def Mprint(text, speed=0.03):

    for char in text:

        sys.stdout.write(char)

        sys.stdout.flush()

        time.sleep(speed)

    print()


def teamLoad():

    teams = open("team.json", "r")
    team_d = json.load(teams)

    availTeams = []

    for team_id in team_d:
        fName = team_d[team_id]["name"]

        availTeams.append(fName)

    return team_d, availTeams


# Ball Logics
data, availT = teamLoad()

oc = [0, 1, 2, 3, 4, 5, 6, 'WK', 'WD', 'NB']
wick = ['Bowled', 'Caught',  'Caught Behind',
        'Caught & Bowl', 'HitWicket', 'LBW']

role_weight = {
    # 0, 1, 2, 3, 4, 5, 6, 'WK', 'WD', 'NB'
    "Top Order":    [20, 25, 20, 3, 30, 2, 25, 15, 5, 5],
    "Middle Order": [18, 28, 25, 3, 35, 2, 35, 25, 5, 5],
    "Lower Order":  [25, 20, 18, 1, 22, 1, 40, 10, 5, 5]

}


def toss(user, opp):

    tWin = None
    call = None
    elect = None
    t = [
        inquirer.List("call", message="What's Your Call",
                      choices=("Heads", "Tails"))
    ]

    tq = inquirer.prompt(t)
    call = tq["call"]

    if random.random() >= 0.5:
        if call == "Heads":
            tWin = user
        else:
            tWin = opp
    else:
        if call == "Tails":
            tWin = user
        else:
            tWin = opp

    if tWin == user:
        e = [
            inquirer.List(
                "elect", message="You won the toss! What will you do first ?", choices=("Bat", "Bowl"))
        ]
        Mprint(f"{call} is the call and {call} it is!")

        eq = inquirer.prompt(e)
        haveToDo = eq["elect"]
    else:
        if call == "Heads":
            callNot = "Tails"
        if call == "Heads":
            callNot = "Tails"
        Mprint(f"{call} is the call and {callNot} it is!")
        if random.random() >= 0.5:
            haveToDo = "Bat"
            Mprint(f"{opp} won the toss and have decided to bowl first!")
        else:
            haveToDo = "Bowl"
            Mprint(f"{opp} won the toss and have decided to bat first!")

    return haveToDo, tWin


def bowlSim(role, b_skill, intent):
    current_Weights = role_weight[role].copy()

    bat_skill = int(b_skill)

    if bat_skill >= 90:
        current_Weights[4] += 10
        current_Weights[6] += 8

        # wicket
        current_Weights[7] -= 5
        current_Weights[0] -= 10

    elif bat_skill >= 75 and bat_skill < 90:
        current_Weights[4] += 2
        current_Weights[6] += 1

        # wicket
        current_Weights[1] += 5
        current_Weights[2] += 4
    elif bat_skill >= 50 and bat_skill < 75:
        current_Weights[6] -= 4
        current_Weights[4] -= 5
        current_Weights[2] += 1
        current_Weights[7] += 10

    if intent == 1:
        current_Weights[0] += 10
        current_Weights[1] += 12
        current_Weights[2] += 5
        current_Weights[4] -= 10
        current_Weights[6] -= 15
        current_Weights[7] -= 20
    elif intent == 3:
        current_Weights[0] += 15
        current_Weights[1] += 1
        current_Weights[2] += 1
        current_Weights[4] += 10
        current_Weights[6] += 15
        current_Weights[7] += 20

    result = random.choices(oc, weights=current_Weights, k=1)[0]

    if result == 'WK':
        result = random.choice(wick)

    return result


def mainMenu():

    q = [
        inquirer.List('userT', message="Choose your Team : ",
                      choices=availT)
    ]

    ans = inquirer.prompt(q)
    userTeam = ans["userT"]

    oppTeam = None

    while oppTeam == userTeam or oppTeam == None:
        q = [
            inquirer.List(
                "oppT", message="Choose your Opponent's Team", choices=availT)
        ]
        a = inquirer.prompt(q)
        oppTeam = a["oppT"]

        if oppTeam == userTeam:
            Mprint("You can't play against your own team !")
        elif oppTeam == None:
            Mprint("Please select a team to start match")

    Mprint(f"It's {userTeam} VS {oppTeam}! Its time for Toss!")

    haveToDo, tWin = toss(userTeam, oppTeam)
    uRost = get_roster_by_name(data, userTeam)
    oRost = get_roster_by_name(data, oppTeam)

    matchSim(tWin, haveToDo, userTeam, oppTeam, uRost, oRost)


def get_roster_by_name(all_teams, selected_name):
    for team_key, team_data in all_teams.items():
        if team_data["name"] == selected_name:
            return team_data["players"]
    return []


def matchSim(tWin, have, user, opp, userRost, oppRost):

    Inning = 1
    if have == "Bat":
        fBat = user
        fBatP = userRost
        sBat = opp
        sBatP = oppRost
    else:
        fBat = opp
        fBatP = oppRost
        sBat = opp
        sBatP = oppRost

    target = 0

    def Inn(team, players, target=None):

        for player in players:
            player["runs_scored"] = 0
            player["balls_faced"] = 0
            player["isNotOut"] = True
            player["4s"] = 0
            player["6s"] = 0
            player["SR"] = 0

        tRun = 0
        tWick = 0
        tOver = 0

        curBall = 0
        striker = players[0]
        nStriker = players[1]

        nextBat = 2

        while tOver != 5:
            print(f"\n===========================================")
            Mprint(f"   START OF OVER {tOver + 1} | Score: {tRun}/{tWick}")
            Mprint(
                f"   On Strike: {striker['name']} | Non-Strike: {nStriker['name']}")
            print(f"===========================================")

            print(
                "Set Strategy for this over: [1] Defend  [2] Normal  [3] Attack")
            user_intent = input("Enter 1, 2, or 3 (Press Enter for Normal): ")
            if user_intent not in ["1", "3"]:
                user_intent = "2"

            Mprint("\nBowling the over...\n")
            while curBall < 6:

                result = bowlSim(
                    striker["role"], striker["b-skill"], user_intent)

                print(
                    f"  Over {tOver}.{curBall + 1} | {striker['name']} faces... {result}")

                time.sleep(0.5)

                if striker['balls_faced'] != 0:
                    sr = (striker['runs_scored'] /
                          striker['balls_faced']) * 100
                    striker['SR'] = round(sr, 2)

                if result != "WD" and result != "NB":
                    curBall += 1
                    striker["balls_faced"] += 1

                if result in wick:
                    striker["isNotOut"] = False
                    tWick += 1

                    if tWick == 10:
                        print("\n ", "All Out!")
                        break
                    striker = players[nextBat]
                    nextBat += 1

                elif result == "WD" or result == "NB":
                    tRun += 1
                else:
                    tRun += result
                    striker["runs_scored"] += result
                    if result == 4:
                        striker['4s'] += 1
                    elif result == 6:
                        striker['6s'] += 1

                    if result % 2 != 0:
                        striker, nStriker = nStriker, striker

                if target is not None and tRun >= target:

                    break

            tOver += 1
            striker, nStriker = nStriker, striker
            curBall = 0
            print(f"\nEnd of Over {tOver} | {team}: {tRun}/{tWick}\n")
        target = tRun + 1
        time.sleep(1)
        print(f"\n======================================")
        print(f"      {team.upper()} INNINGS SCORECARD      ")
        print(f"======================================")

        for p in players:

            if p["balls_faced"] > 0 or p == striker or p == nStriker:

                name_padded = p["name"].ljust(20)

                if p['isNotOut']:
                    print(
                        f"{name_padded} {p['runs_scored']}* ({p['balls_faced']})  || SR : {p['SR']}  4s: {p['4s']}  6s: {p['6s']}")
                else:
                    print(
                        f"{name_padded} {p['runs_scored']} ({p['balls_faced']})   || SR : {p['SR']}  4s: {p['4s']}  6s: {p['6s']}")

        print(f"======================================\n")
        return tRun, tWick

    scoreA, wickA = Inn(fBat, fBatP)
    target = scoreA + 1

    Mprint(f"{fBat} have scored {scoreA} for {wickA} wickets. {sBat} needs {target} runs in 5 Overs. \n")

    scoreB, wickB = Inn(sBat, sBatP, target)

    if scoreB >= target:
        Mprint(f"{sBat} have won the match by {wickB} wickets !")
    elif scoreA == scoreB:
        Mprint(f" Its a tie between {fBat} and {sBat}")
    else:
        Mprint(f"{fBat} have won the match by {scoreA - scoreB} runs!")


mainMenu()
