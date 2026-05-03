import json
import random
# Importing Teams


def teamLoad():

    teams = open("team.json", "r")
    team_d = json.load(teams)

    # Team storage
    team_a = team_d["team_a"]
    nameA = team_a["name"]
    playersA = team_a["players"]

    team_b = team_d["team_b"]
    nameB = team_b["name"]
    playersB = team_b["players"]

    return nameA, playersA, nameB, playersB


# Ball Logics
nameA, playersA, nameB, playersB = teamLoad()

oc = [0, 1, 2, 3, 4, 5, 6, 'WK', 'WD', 'NB']
wick = ['Bowled', 'Caught',  'Caught Behind',
        'Caught & Bowl', 'HitWicket', 'LBW']

role_weight = {
    # 0, 1, 2, 3, 4, 5, 6, 'WK', 'WD', 'NB'
    "Top Order":    [20, 25, 20, 12, 30, 15, 25, 15, 5, 5],
    "Middle Order": [18, 28, 25, 12, 35, 20, 35, 25, 5, 5],
    "Lower Order":  [25, 20, 18, 5, 22, 10, 40, 10, 5, 5]

}


def bowlSim(role, b_skill):
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

    result = random.choices(oc, weights=current_Weights, k=1)[0]

    if result == 'WK':
        result = random.choice(wick)

    return result


def matchSim():
    Inning = 1
    fBat = nameA
    fBatP = playersA

    sBat = nameB
    sBatP = playersB
    target = 0

    def I1(fBat, fBatP, sBat):
        tRun = 0
        tWick = 0
        tOver = 0

        curBall = 0
        striker = fBatP[0]
        nStriker = fBatP[1]

        nextBat = 2

        while tOver != 5:

            while curBall < 6:
                result = bowlSim(striker["role"], striker["b-skill"])
                print(striker["name"], "is on strike : ", result)

                if result != "WD" and result != "NB":
                    curBall += 1

                if result in wick:
                    tWick += 1

                    if tWick == 10:
                        print("\n ", "All Out!")
                        break
                    striker = fBatP[nextBat]
                    nextBat += 1

                elif result == "WD" or result == "NB":
                    tRun += 1
                else:
                    tRun += result
                    if result % 2 != 0:
                        striker, nStriker = nStriker, striker

            tOver += 1
            striker, nStriker = nStriker, striker
            curBall = 0
            print("", fBat, ":", tRun, "/", tWick, " : ", tOver,  "\n")
        target = tRun + 1
        print(sBat, " needs ", target, " runs in 5 over to Win the match", "\n")
        return target

    def I2(sBat, sBatP, target, fBat):
        tRun = 0
        tWick = 0
        tOver = 0

        curBall = 0
        striker = sBatP[0]
        nStriker = sBatP[1]

        nextBat = 2

        while tOver != 5:

            while curBall < 6:
                result = bowlSim(striker["role"], striker["b-skill"])
                print(striker["name"], "is on strike : ", result)

                if result != "WD" and result != "NB":
                    curBall += 1

                if result in wick:
                    tWick += 1

                    if tWick == 10:
                        print("\n ", "All Out!")
                        break
                    striker = sBatP[nextBat]
                    nextBat += 1

                elif result == "WD" or result == "NB":
                    tRun += 1
                else:
                    tRun += result
                    if result % 2 != 0:
                        striker, nStriker = nStriker, striker

                    if tRun >= target:
                        print(sBat, " Won by ", (10 - tWick), "wickets!")
                        break

            tOver += 1
            striker, nStriker = nStriker, striker
            curBall = 0
            print("", sBat, ":", tRun, "/", tWick, " : ", tOver,  "\n")

        if tRun == target or tRun > target:
            print(sBat, " Won by ", (10 - tWick), "wickets!")
        else:
            print(fBat, "Won by ", (target - tRun), "runs!")

    aTarget = I1(fBat, fBatP, sBat)
    I2(sBat, sBatP, aTarget, fBat)


matchSim()
