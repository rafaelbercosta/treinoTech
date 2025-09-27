import Cycle from '../models/Cycle.js';
import Workout from '../models/workout.js';

export const createCycle = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, descricao } = req.body;
    
    // Desativar ciclos anteriores
    await Cycle.updateMany(
      { usuario: req.user.id, ativo: true },
      { ativo: false }
    );

    const novoCiclo = new Cycle({
      nome,
      dataInicio: dataInicio ? new Date(dataInicio + 'T00:00:00') : new Date(),
      dataFim: dataFim ? new Date(dataFim + 'T00:00:00') : undefined,
      descricao,
      usuario: req.user.id
    });

    await novoCiclo.save();
    res.json(novoCiclo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCycles = async (req, res) => {
  try {
    const ciclos = await Cycle.find({ usuario: req.user.id })
      .sort({ dataInicio: -1 });
    res.json(ciclos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveCycle = async (req, res) => {
  try {
    let cicloAtivo = await Cycle.findOne({
      usuario: req.user.id,
      ativo: true 
    });

    // Se não há ciclo ativo, verificar se o usuário tem algum ciclo
    if (!cicloAtivo) {
      const totalCiclos = await Cycle.countDocuments({ usuario: req.user.id });
      
      // Se o usuário não possui nenhum ciclo, criar um padrão
      if (totalCiclos === 0) {
        cicloAtivo = new Cycle({
          nome: "Ciclo Inicial",
          dataInicio: new Date(),
          descricao: "Ciclo criado automaticamente",
          usuario: req.user.id
        });
        await cicloAtivo.save();

        // Migrar treinos existentes para este ciclo
        await Workout.updateMany(
          { userId: req.user.id, cicloId: { $exists: false } },
          { cicloId: cicloAtivo._id }
        );
      } else {
        // Se o usuário tem ciclos mas nenhum está ativo, ativar o mais recente
        const ultimoCiclo = await Cycle.findOne({ usuario: req.user.id })
          .sort({ dataInicio: -1 });
        
        if (ultimoCiclo) {
          ultimoCiclo.ativo = true;
          await ultimoCiclo.save();
          cicloAtivo = ultimoCiclo;
        }
      }
    }

    res.json(cicloAtivo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateCycle = async (req, res) => {
  try {
    // Desativar todos os ciclos
    await Cycle.updateMany(
      { usuario: req.user.id },
      { ativo: false }
    );

    // Ativar o ciclo selecionado
    const ciclo = await Cycle.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      { ativo: true },
      { new: true }
    );

    if (!ciclo) {
      return res.status(404).json({ message: "Ciclo não encontrado" });
    }

    res.json(ciclo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCycle = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, descricao } = req.body;
    
    const ciclo = await Cycle.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      { 
        nome, 
        dataInicio: dataInicio ? new Date(dataInicio + 'T00:00:00') : undefined,
        dataFim: dataFim ? new Date(dataFim + 'T00:00:00') : undefined,
        descricao 
      },
      { new: true }
    );

    if (!ciclo) {
      return res.status(404).json({ message: "Ciclo não encontrado" });
    }

    res.json(ciclo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCycle = async (req, res) => {
  try {
    const ciclo = await Cycle.findOne({ 
      _id: req.params.id, 
      usuario: req.user.id 
    });

    if (!ciclo) {
      return res.status(404).json({ message: "Ciclo não encontrado" });
    }

    await Cycle.findByIdAndDelete(req.params.id);
    res.json({ message: "Ciclo deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
