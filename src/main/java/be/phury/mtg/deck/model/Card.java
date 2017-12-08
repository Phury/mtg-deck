package be.phury.mtg.deck.model;

import be.phury.mtg.deck.ApiModel;
import be.phury.mtg.deck.utils.Colors;

import java.util.List;
import java.util.Set;

/**
 * Created by Phury
 */
public class Card extends ApiModel {
    private String name;
    private String type;
    private List<String> superTypes;
    private List<String> types;
    private List<String> subTypes;
    private String manaCost;
    private Integer convertedManaCost;
    private String oracle;
    private String flavor;
    private String powerToughness;
    private List<String> editions;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getSuperTypes() {
        return superTypes;
    }

    public void setSuperTypes(List<String> superTypes) {
        this.superTypes = superTypes;
    }

    public List<String> getTypes() {
        return types;
    }

    public void setTypes(List<String> types) {
        this.types = types;
    }

    public List<String> getSubTypes() {
        return subTypes;
    }

    public void setSubTypes(List<String> subTypes) {
        this.subTypes = subTypes;
    }

    public String getManaCost() {
        return manaCost;
    }

    public void setManaCost(String manaCost) {
        this.manaCost = manaCost;
    }

    public Integer getConvertedManaCost() {
        return convertedManaCost;
    }

    public void setConvertedManaCost(Integer convertedManaCost) {
        this.convertedManaCost = convertedManaCost;
    }

    public String getOracle() {
        return oracle;
    }

    public void setOracle(String oracle) {
        this.oracle = oracle;
    }

    public String getFlavor() {
        return flavor;
    }

    public void setFlavor(String flavor) {
        this.flavor = flavor;
    }

    public String getPowerToughness() {
        return powerToughness;
    }

    public void setPowerToughness(String powerToughness) {
        this.powerToughness = powerToughness;
    }

    public List<String> getEditions() {
        return editions;
    }

    public void setEditions(List<String> editions) {
        this.editions = editions;
    }

    public Set<String> getColors() {
        return Colors.parse(getManaCost());
    }
}
