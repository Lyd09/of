"use client";

import React from 'react';
import { ServiceContractData, companyData } from '@/types/contract';
import { boldenContractTerms } from '@/lib/contract-utils';
import numero from 'numero-por-extenso';

interface ContractPreviewProps {
  data: ServiceContractData;
}

const termsToBold = ["CONTRATANTE", "CONTRATANTES", "CONTRATADA", "OBJETO DO CONTRATO", "VALOR E FORMA DE PAGAMENTO", "PRAZO DE ENTREGA", "RESPONSABILIDADES", "DIREITOS AUTORAIS", "RESCISÃO", "FORO"];
const clauseTitles = ["OBJETO DO CONTRATO", "VALOR E FORMA DE PAGAMENTO", "PRAZO DE ENTREGA", "RESPONSABILIDADES", "DIREITOS AUTORAIS", "RESCISÃO", "FORO"];

const Clause: React.FC<{ title: string; number: number; children: React.ReactNode }> = ({ title, number, children }) => (
  <div className="mb-4">
    <p className="font-bold">
      {boldenContractTerms(`Cláusula ${number} – ${title.toUpperCase()}`, termsToBold)}
    </p>
    <p className="text-justify">{children}</p>
  </div>
);

export function ContractPreview({ data }: ContractPreviewProps) {
  const {
    contractTitle,
    contractors,
    object,
    totalValue,
    paymentMethod,
    paymentSignalPercentage,
    paymentMethodOther,
    deliveryDeadline,
    contractorResponsibilities,
    clientResponsibilities,
    copyright,
    rescissionNoticePeriod,
    rescissionFine,
    jurisdiction,
    signatureCity,
    signatureDate,
  } = data || {};

  const getPaymentDescription = () => {
    if (!totalValue || totalValue <= 0) return 'A definir.';

    const fullValueText = `R$ ${totalValue.toFixed(2)} (${numero.porExtenso(totalValue, numero.estilo.monetario)})`;
    switch (paymentMethod) {
      case 'À vista':
        return `O valor total de ${fullValueText} deverá ser pago à vista na assinatura deste contrato.`;
      case 'Sinal + Entrega':
        const signal = totalValue * ((paymentSignalPercentage || 50) / 100);
        const remainder = totalValue - signal;
        return `O valor total de ${fullValueText} será pago da seguinte forma: um sinal de R$ ${signal.toFixed(2)} na assinatura do contrato, e o valor restante de R$ ${remainder.toFixed(2)} na entrega final dos serviços.`;
      case 'Outro':
        return paymentMethodOther || 'Forma de pagamento a ser descrita.';
      default:
        return 'Forma de pagamento não especificada.';
    }
  };


  return (
    <div className="bg-white text-black p-12 shadow-lg" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      <h1 className="text-center font-bold text-lg mb-8">{contractTitle || 'TÍTULO DO CONTRATO'}</h1>

      <div className="mb-6 space-y-4">
        <div>
            <p><strong className="font-bold">CONTRATADA:</strong></p>
            <p className="text-justify"><strong>NOME:</strong> {companyData.name}, pessoa jurídica de direito privado, inscrita no <strong>CNPJ</strong> sob o nº {companyData.cnpj}, com sede em <strong>ENDEREÇO:</strong> {companyData.address}, e <strong>E-MAIL:</strong> {companyData.email}.</p>
        </div>
        
        <p className="font-bold text-justify">e de outro lado:</p>

        <div>
            <p><strong className="font-bold">{contractors?.length > 1 ? 'CONTRATANTES:' : 'CONTRATANTE:'}</strong></p>
            {contractors?.map((c, i) => (
                <p key={c.id || i} className="text-justify">
                    <strong>NOME:</strong> {c.name || `Nome do Contratante ${i+1}`}, inscrito(a) no <strong>CPF/CNPJ</strong> sob o nº {c.cpfCnpj || '000.000.000-00'}, residente e domiciliado(a) em <strong>ENDEREÇO:</strong> {c.address || 'Endereço do Contratante'}, e <strong>E-MAIL:</strong> {c.email || 'email@contratante.com'}.
                </p>
            ))}
        </div>
        <p className="text-justify">Resolvem, de comum acordo, celebrar o presente contrato, que se regerá pelas seguintes cláusulas e condições:</p>
      </div>
      
      <Clause title="OBJETO DO CONTRATO" number={1}>
        {boldenContractTerms(object || 'Objeto a ser definido...', termsToBold)}
      </Clause>

      <Clause title="VALOR E FORMA DE PAGAMENTO" number={2}>
        {boldenContractTerms(getPaymentDescription(), termsToBold)}
      </Clause>

      <Clause title="PRAZO DE ENTREGA" number={3}>
        {boldenContractTerms(deliveryDeadline || 'Prazo a definir.', termsToBold)}
      </Clause>

       <Clause title="RESPONSABILIDADES" number={4}>
          <span className="font-bold">Compete à CONTRATADA:</span>
          <ul className="list-disc list-inside">
             {contractorResponsibilities?.split('\n').map((item, index) => item && <li key={index}>{boldenContractTerms(item, termsToBold)}</li>)}
          </ul>
          <br/>
          <span className="font-bold">Compete ao(s) CONTRATANTE(S):</span>
           <ul className="list-disc list-inside">
             {clientResponsibilities?.split('\n').map((item, index) => item && <li key={index}>{boldenContractTerms(item, termsToBold)}</li>)}
          </ul>
       </Clause>
      
       <Clause title="DIREITOS AUTORAIS" number={5}>
        {boldenContractTerms(copyright || '', termsToBold)}
       </Clause>

       <Clause title="RESCISÃO" number={6}>
         {boldenContractTerms(`O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio por escrito com antecedência mínima de ${rescissionNoticePeriod || 0} dias. Em caso de rescisão imotivada por parte do CONTRATANTE, será devida uma multa correspondente a ${rescissionFine || 0}% do valor total do contrato.`, termsToBold)}
       </Clause>
      
       <Clause title="FORO" number={7}>
          {boldenContractTerms(`Fica eleito o foro da comarca de ${jurisdiction || 'Cidade/UF'} para dirimir quaisquer controvérsias oriundas do presente contrato.`, termsToBold)}
       </Clause>

      <div className="mt-16 text-center">
        <p>{signatureCity || 'Cidade'}, {signatureDate || 'Data'}.</p>
      </div>

       <div className="mt-16 space-y-8">
        <div className="text-center">
            <p>_________________________________________</p>
            <p>FastFilms</p>
        </div>
        {contractors?.map((c, i) => (
            <div key={c.id || i} className="text-center">
                <p>_________________________________________</p>
                <p>{c.name || 'Nome do Contratante'}</p>
            </div>
        ))}
      </div>

    </div>
  );
}
