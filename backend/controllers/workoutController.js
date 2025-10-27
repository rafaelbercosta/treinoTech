import Workout from '../models/workout.js'

export const createWorkout = async(req, res) => {
    try {
        const { nome, cicloId } = req.body;

        const workout = await Workout.create({
            userId: req.user.id,
            cicloId: cicloId || null,
            nome,
            exercicios: [],
            historico: [],
        });

        res.status(201).json(workout);
    } catch (err) {
        res.status(500).json({message: "Erro ao criar treino", error: err.message});
    }
};

export const getWorkouts = async (req, res) => {
    try {
        const { cicloId } = req.query;
        const query = { userId: req.user.id };
        
        if (cicloId) {
            query.cicloId = cicloId;
        }

        const workouts = await Workout.find(query);
        res.json(workouts);
    } catch (error) {
        res.status(500).json({message: "Erro ao buscar treinos", error});
    };

};

export const updateWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { nome } = req.body;

    const workout = await Workout.findById(workoutId);
    if (!workout) return res.status(404).json({ message: "Treino não encontrado" });

    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Não autorizado" });
    }

    workout.nome = nome ?? workout.nome;
    await workout.save();

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar treino", error: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    const workout = await Workout.findById(workoutId);
    if (!workout) return res.status(404).json({ message: "Treino não encontrado" });

    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Não autorizado" });
    }

    await workout.deleteOne();
    res.json({ message: "Treino removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover treino", error: error.message });
  }
};

export const addExercise = async (req, res) => {
    try {
        const { nome, series, repeticoes, carga, tempoDescanso, observacoes, metodoIntensificacao} = req.body;
        const workout = await Workout.findById(req.params.workoutId);

        if (!workout) return res.status(404).json({message: "Treino não encontrado"});
        if (workout.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Não autorizado"});
        }

        workout.exercicios.push({nome, series, repeticoes, carga, tempoDescanso, observacoes, metodoIntensificacao });
        await workout.save();

        res.json(workout);
    } catch (error) {
        res.status(500).json({message: "Erro ao adicionar exercício", error});
    }
};

export const updateExercise = async (req, res) => {
    try {
        const {nome, series, repeticoes, carga, tempoDescanso, observacoes, metodoIntensificacao} = req.body;
        const workout = await Workout.findById(req.params.workoutId);

        if (!workout) return res.status(404).json({message: "Treino não encontrado"});

        const exercise = workout.exercicios.id(req.params.exerciseId);
        if (!exercise) return res.status(404).json({message: "Exercício não encontrado"});

        exercise.nome = nome ?? exercise.nome;
        exercise.series = series ?? exercise.series;
        exercise.repeticoes = repeticoes ?? exercise.repeticoes;
        exercise.carga = carga ?? exercise.carga;
        exercise.tempoDescanso = tempoDescanso ?? exercise.tempoDescanso;
        exercise.observacoes = observacoes ?? exercise.observacoes;
        exercise.metodoIntensificacao = metodoIntensificacao ?? exercise.metodoIntensificacao;

        await workout.save();
        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar exercício", error});
    }
};

export const deleteExercise = async  (req, res) => {
    try {
        const workout = await Workout.findById(req.params.workoutId);

        if (!workout) return res.status(404).json({message: "Treino não encontrado!"});

        workout.exercicios = workout.exercicios.filter(
            (ex) => ex._id.toString() !== req.params.exerciseId
        );

        await workout.save();
        res.json(workout);
    } catch (error) {
        res.status(500).json({message: "Erro ao remover exercício", error});
    }
};

export const addHistory = async (req, res) => {
    try {
        const {data, observacoes} = req.body;
        const workout = await Workout.findById(req.params.workoutId);

        if (!workout) return res.status(404).json({message: "Treino não encontrado"});

        workout.historico.push({data, observacoes});
        await workout.save();

        res.json(workout);
    } catch (error) {
        res.status(500).json({message: "Erro ao adicionar historico", error});
    }
};

export const deleteHistory = async (req, res) => {
  try {
    const { workoutId, historyId } = req.params;
    const workout = await Workout.findById(workoutId);
    if (!workout) return res.status(404).json({message: "Treino não encontrado"});
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({message: "Não autorizado"});
    }
    workout.historico = workout.historico.filter(
      (h) => h._id.toString() !== historyId

    );

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(500).json({message: "Erro ao remover histórico", error: error.message});
  }
};